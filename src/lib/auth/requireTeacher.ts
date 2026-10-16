import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Teacher } from '@/lib/types';

// 파트 0 소유. 서버 액션·API·서버 컴포넌트에서 "승인된 교사인지"를 확인한다(dorms-check code.endpoint.unauth).
export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

export async function getTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, teacher: null as Teacher | null };
  const { data } = await supabase.from('teachers').select('*').eq('id', user.id).maybeSingle();
  return { supabase, user, teacher: (data as Teacher | null) ?? null };
}

export async function requireTeacher(options?: { admin?: boolean }) {
  const { supabase, user, teacher } = await getTeacher();
  if (!user) throw new AuthError(401, '로그인이 필요해요.');
  if (!teacher || !teacher.approved) throw new AuthError(403, '승인된 교사만 쓸 수 있어요.');
  if (options?.admin && teacher.role !== 'admin') throw new AuthError(403, '담당자만 할 수 있어요.');
  return { supabase, user, teacher };
}

// 서버 액션 결과. 화면은 message를 토스트로 보여 준다.
export type ActionResult<T = undefined> = { ok: true; message?: string; data?: T } | { ok: false; message: string };

export async function runAction<T = undefined>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: e.message };
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `저장하지 못했어요. ${message}` };
  }
}
