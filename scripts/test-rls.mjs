// dorms-check 차단 항목(code.rls.anon-read) 자체 확인: 로그인하지 않은 키(anon)로 모든 테이블이 0행인지 본다.
// 실행: npm run test:rls
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('✗ .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 넣어 주세요.');
  process.exit(1);
}

const tables = [
  'teachers', 'terms', 'settings', 'subjects', 'achievement_standards', 'assessment_items', 'students', 'enrollments',
  'scores', 'subject_attendance', 'diagnoses', 'guidance_targets', 'sessions', 'session_attendance', 'phrase_snippets',
  'completion_results', 'worksheets', 'ai_usage',
];

const supabase = createClient(url, anon, { auth: { persistSession: false } });
let leaks = 0;
for (const t of tables) {
  const { data, error } = await supabase.from(t).select('*').limit(5);
  const n = data?.length ?? 0;
  if (n > 0) {
    leaks += 1;
    console.log(`✗ ${t}: 로그인 없이 ${n}행이 보여요`);
  } else {
    console.log(`✓ ${t}: 0행${error ? ' (접근 거부)' : ''}`);
  }
}
console.log(leaks ? `\n✗ ${leaks}개 테이블이 열려 있어요. RLS를 확인하세요.` : '\n✓ 모든 테이블이 로그인 없이 0행이에요.');
process.exit(leaks ? 1 : 0);
