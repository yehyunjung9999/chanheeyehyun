import 'server-only';
import type { ServerSupabase } from '@/lib/supabase/server';
import type { Settings, Term } from '@/lib/types';

// 파트 0 소유. 현재 학기와 기준값을 읽는다. 숫자 기준은 반드시 여기서 읽고 코드에 쓰지 않는다.
export async function getCurrentTerm(supabase: ServerSupabase) {
  const { data: term } = await supabase.from('terms').select('*').eq('is_current', true).maybeSingle();
  if (!term) return { term: null, settings: null };
  const { data: settings } = await supabase.from('settings').select('*').eq('term_id', term.id).maybeSingle();
  return { term: term as Term, settings: (settings as Settings | null) ?? null };
}

export function termLabel(term: Term | null) {
  return term ? `${term.school_year}학년도 ${term.semester}학기` : '학기 미설정';
}
