'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireTeacher, runAction, type ActionResult } from '@/lib/auth/requireTeacher';
import { loadB, revalidateB } from '@/lib/b/data';
import { getCurrentTerm } from '@/lib/settings';

// 파트 B 서버 액션. 모두 requireTeacher()로 시작하고 { ok, message }를 돌려준다.

const sessionInput = z.object({
  id: z.string().uuid().optional(),
  subject_id: z.string().uuid().nullable(),
  kind: z.enum(['prevention', 'remedial', 'attendance', 'creative_attendance', 'emotional_common']),
  method: z.enum(['face_to_face', 'after_school', 'online_content', 'assignment', 'mentoring', 'in_class', 'emotional', 'external_program']),
  held_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜를 골라 주세요.'),
  period_label: z.string().max(20),
  hours: z.number().positive('시수는 0.5 이상이어야 해요.').max(12).refine((h) => Number.isInteger(h * 2), '시수는 0.5 단위로 적어 주세요.'),
  content: z.string().max(2000),
  attendance: z
    .array(z.object({ student_id: z.string().uuid(), status: z.enum(['present', 'late', 'absent']) }))
    .min(1, '출석할 학생이 없어요. 과목과 종류를 확인해 주세요.'),
});
export type SessionInput = z.infer<typeof sessionInput>;

export async function saveSession(input: SessionInput): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { supabase } = await requireTeacher();
    const parsed = sessionInput.safeParse(input);
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? '입력을 확인해 주세요.' };
    const v = parsed.data;
    const { term } = await getCurrentTerm(supabase);
    if (!term) return { ok: false, message: '현재 학기가 설정되지 않았어요. 담당자에게 알려 주세요.' };

    const row = {
      term_id: term.id,
      subject_id: v.kind === 'emotional_common' ? null : v.subject_id,
      kind: v.kind,
      method: v.kind === 'emotional_common' ? ('emotional' as const) : v.method,
      held_on: v.held_on,
      period_label: v.period_label,
      hours: v.hours,
      content: v.content.trim(),
    };
    let id = v.id;
    if (id) {
      const { error, count } = await supabase.from('sessions').update(row, { count: 'exact' }).eq('id', id);
      if (error) throw new Error(error.message);
      if (!count) return { ok: false, message: '본인이 쓴 일지만 고칠 수 있어요.' };
      const del = await supabase.from('session_attendance').delete().eq('session_id', id);
      if (del.error) throw new Error(del.error.message);
    } else {
      const { data, error } = await supabase.from('sessions').insert(row).select('id').single();
      if (error) throw new Error(error.message);
      id = data.id as string;
    }
    const att = v.attendance.map((a) => ({
      session_id: id!, student_id: a.student_id, status: a.status, credited_hours: a.status === 'absent' ? 0 : v.hours,
    }));
    const { error: attError } = await supabase.from('session_attendance').insert(att);
    if (attError) throw new Error(attError.message);
    revalidateB(revalidatePath);
    return { ok: true, message: '일지를 저장했어요. 시수와 경고가 다시 계산됐어요.', data: { id: id! } };
  });
}

export async function deleteSession(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireTeacher();
    if (!z.string().uuid().safeParse(id).success) return { ok: false, message: '잘못된 일지예요.' };
    const { error, count } = await supabase.from('sessions').delete({ count: 'exact' }).eq('id', id);
    if (error) throw new Error(error.message);
    if (!count) return { ok: false, message: '본인이 쓴 일지만 지울 수 있어요.' };
    revalidateB(revalidatePath);
    return { ok: true, message: '일지를 지웠어요. 시수가 다시 계산됐어요.' };
  });
}

export async function addPhrase(text: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, teacher } = await requireTeacher();
    const t = text.trim();
    if (!t || t.length > 60) return { ok: false, message: '자주 쓰는 문장은 1~60자로 적어 주세요.' };
    const { error } = await supabase.from('phrase_snippets').insert({ teacher_id: teacher.id, text: t, sort_order: Date.now() % 1_000_000 });
    if (error) throw new Error(error.message);
    revalidatePath('/journal');
    return { ok: true, message: '자주 쓰는 문장에 추가했어요.' };
  });
}

export async function setReach(targetId: string, value: 'reached' | 'not_reached' | null): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireTeacher();
    if (!z.string().uuid().safeParse(targetId).success) return { ok: false, message: '잘못된 대상자예요.' };
    if (value !== null && value !== 'reached' && value !== 'not_reached') return { ok: false, message: '도달 판정 값을 확인해 주세요.' };
    const { data: existing } = await supabase.from('completion_results').select('id, result').eq('target_id', targetId).maybeSingle();
    if (existing?.result && existing.result !== 'pending') return { ok: false, message: '이미 확정된 학생이에요. 담당자에게 확정 취소를 요청해 주세요.' };
    const { error } = existing
      ? await supabase.from('completion_results').update({ reach_judgment: value }).eq('id', existing.id)
      : await supabase.from('completion_results').insert({ target_id: targetId, reach_judgment: value });
    if (error) throw new Error(error.message);
    revalidateB(revalidatePath);
    return { ok: true, message: value ? '도달 판정을 저장했어요.' : '도달 판정을 지웠어요.' };
  });
}

/** 담당자: 이수 가능한 학생만 이수(passed)로 확정한다. 이수 불가 학생은 확정하지 않는다. */
export async function confirmCompletable(committeeDate: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, teacher } = await requireTeacher({ admin: true });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(committeeDate)) return { ok: false, message: '학관위 심의일을 먼저 넣어 주세요.' };
    const b = await loadB(supabase, teacher);
    if (!b) return { ok: false, message: '현재 학기가 설정되지 않았어요.' };
    const todo = b.rows.filter((r) => r.progress?.completable && r.completion?.result !== 'passed');
    const now = new Date().toISOString();
    for (const r of todo) {
      const patch = { result: 'passed' as const, committee_date: committeeDate, decided_by: teacher.id, decided_at: now };
      const { error } = r.completion
        ? await supabase.from('completion_results').update(patch).eq('id', r.completion.id)
        : await supabase.from('completion_results').insert({ target_id: r.target.id, ...patch });
      if (error) throw new Error(error.message);
    }
    revalidateB(revalidatePath);
    return { ok: true, message: todo.length ? `${todo.length}명을 이수로 확정했어요(학관위 ${committeeDate}).` : '새로 확정할 이수 가능 학생이 없어요.' };
  });
}

/** 담당자: 확정을 되돌린다(심의 결과가 바뀐 경우). */
export async function undoCompletion(targetId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireTeacher({ admin: true });
    if (!z.string().uuid().safeParse(targetId).success) return { ok: false, message: '잘못된 대상자예요.' };
    const { error } = await supabase
      .from('completion_results').update({ result: 'pending', committee_date: null, decided_by: null, decided_at: null }).eq('target_id', targetId);
    if (error) throw new Error(error.message);
    revalidateB(revalidatePath);
    return { ok: true, message: '확정을 취소했어요.' };
  });
}
