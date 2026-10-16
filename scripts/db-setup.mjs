// DB 만들기 + 가짜 데이터 넣기. 실행: npm run db:setup (가짜 데이터만 다시: npm run db:seed)
// .env.local 의 DATABASE_URL(Supabase → Connect → Session pooler 주소)을 쓴다.
import fs from 'node:fs';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('✗ .env.local 에 DATABASE_URL 이 없어요. Supabase → Connect → "Session pooler" 주소를 넣어 주세요.');
  process.exit(1);
}

const seedOnly = process.argv.includes('--seed-only');
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  const { rows } = await client.query("select to_regclass('public.teachers') as t");
  if (!seedOnly) {
    if (rows[0].t) {
      console.log('· 테이블이 이미 있어요. 스키마 만들기는 건너뛰어요.');
    } else {
      await client.query(fs.readFileSync('supabase/migrations/0001_init.sql', 'utf8'));
      console.log('✓ 테이블과 보안 규칙(RLS)을 만들었어요.');
    }
  }
  await client.query('begin');
  await client.query(fs.readFileSync('supabase/seed.sql', 'utf8'));
  await client.query('commit');
  const count = await client.query('select (select count(*) from public.students) as students, (select count(*) from public.guidance_targets) as targets, (select count(*) from public.sessions) as sessions');
  const c = count.rows[0];
  console.log(`✓ 가짜 데이터를 넣었어요. 학생 ${c.students}명, 대상자 ${c.targets}건, 운영 일지 ${c.sessions}건`);
} catch (e) {
  try { await client.query('rollback'); } catch { /* 연결 전 실패 */ }
  console.error('✗ 실패했어요:', e.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
