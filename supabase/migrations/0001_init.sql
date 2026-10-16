-- 보장지도 매니저 · 0001 전체 스키마 (파트 0 소유, 수정 금지 — PRD 제2부 7장)
-- 학생 이름 컬럼은 어디에도 없다. 로그인하지 않은 사용자(anon)는 모든 테이블에서 0행이다.

create extension if not exists pgcrypto;

-- ── 열거값 ──
create type public.teacher_role as enum ('admin', 'teacher');
create type public.subject_category as enum ('common', 'elective', 'vocational', 'liberal', 'creative');
create type public.grading_scale as enum ('five', 'three');
create type public.assessment_kind as enum ('diagnostic', 'performance', 'exam');
create type public.absence_type as enum ('인정결', '질병결', '미인정결', '기타결');
create type public.special_handling as enum ('none', 'exempt', 'exempt_no_extra', 'substitutable');
create type public.cause_tag as enum ('basic_skills', 'motivation', 'attendance_life', 'emotional', 'language', 'practical_skill');
create type public.target_kind as enum ('prevention', 'remedial', 'attendance', 'creative_attendance');
create type public.target_status as enum ('candidate', 'checked', 'excluded', 'confirmed');
create type public.session_kind as enum ('prevention', 'remedial', 'attendance', 'creative_attendance', 'emotional_common');
create type public.session_method as enum ('face_to_face', 'after_school', 'online_content', 'assignment', 'mentoring', 'in_class', 'emotional', 'external_program');
create type public.attendance_status as enum ('present', 'late', 'absent');
create type public.reach_judgment as enum ('reached', 'not_reached');
create type public.completion_result as enum ('pending', 'passed', 'failed');

-- ── 테이블 ──
create table public.teachers (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role public.teacher_role not null default 'teacher',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  school_year int not null,
  semester int not null check (semester in (1, 2)),
  starts_on date,
  ends_on date,
  prevention_start date,
  prevention_end date,
  remedial_start date,
  remedial_end date,
  school_council_approved boolean not null default false,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  unique (school_year, semester)
);
create unique index terms_one_current on public.terms (is_current) where is_current;

create table public.settings (
  term_id uuid primary key references public.terms (id) on delete cascade,
  hours_per_credit_general numeric not null default 3,
  hours_per_credit_vocational numeric not null default 2,
  sessions_per_credit int not null default 16,
  pass_ratio_num int not null default 2,
  pass_ratio_den int not null default 3,
  face_to_face_min_hours numeric not null default 1,
  prevention_cap_ratio numeric not null default 0.5,
  emotional_cap_ratio numeric not null default 0.5,
  emotional_shared_across_subjects boolean not null default true,
  require_reach_judgment boolean not null default true,
  risk_danger_below int not null default 40,
  risk_caution_below int not null default 50,
  absence_warning_ratio numeric not null default 0.25,
  ai_monthly_limit_krw int not null default 10000,
  ai_price_input_per_mtok_krw numeric,
  ai_price_output_per_mtok_krw numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.terms (id) on delete cascade,
  name text not null,
  grade int not null check (grade between 1 and 3),
  department text,
  credits numeric not null check (credits > 0),
  category public.subject_category not null default 'common',
  grading_scale public.grading_scale not null default 'five',
  applies_achievement_rule boolean not null default true,
  required_hours_override numeric check (required_hours_override is null or required_hours_override > 0),
  teacher_id uuid references public.teachers (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.achievement_standards (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  code text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (subject_id, code)
);

create table public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  name text not null,
  kind public.assessment_kind not null,
  max_score numeric not null check (max_score > 0),
  weight_percent numeric not null default 0 check (weight_percent >= 0 and weight_percent <= 100),
  counts_toward_final boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_year int not null,
  student_no text not null check (student_no ~ '^[0-9]{5}$'),
  grade int not null,
  class_no int not null,
  number int not null,
  department text,
  special_handling public.special_handling not null default 'none',
  alt_program_done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (school_year, student_no)
);

create table public.enrollments (
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, subject_id)
);

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  assessment_item_id uuid not null references public.assessment_items (id) on delete cascade,
  score numeric check (score is null or score >= 0),
  absence_type public.absence_type,
  updated_by uuid references public.teachers (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (student_id, assessment_item_id)
);

create table public.subject_attendance (
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  absences numeric not null default 0 check (absences >= 0),
  as_of date,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (student_id, subject_id)
);

create table public.diagnoses (
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  weak_standard_codes text[] not null default '{}',
  causes public.cause_tag[] not null default '{}',
  memo text not null default '',
  updated_by uuid references public.teachers (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (student_id, subject_id)
);

create table public.guidance_targets (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.terms (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete cascade,
  kind public.target_kind not null,
  status public.target_status not null default 'candidate',
  reason text not null default '',
  projected_score int,
  excluded_reason text,
  consent_received boolean not null default false,
  checked_by uuid references public.teachers (id) on delete set null,
  checked_at timestamptz,
  confirmed_by uuid references public.teachers (id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint guidance_targets_unique unique nulls not distinct (term_id, student_id, subject_id, kind)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.terms (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete cascade,
  kind public.session_kind not null,
  method public.session_method not null,
  held_on date not null default current_date,
  period_label text not null default '',
  hours numeric not null default 1 check (hours > 0 and hours * 2 = floor(hours * 2)),
  content text not null default '',
  teacher_id uuid references public.teachers (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_attendance (
  session_id uuid not null references public.sessions (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  status public.attendance_status not null default 'present',
  credited_hours numeric not null default 0 check (credited_hours >= 0),
  primary key (session_id, student_id)
);

create table public.phrase_snippets (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers (id) on delete cascade default auth.uid(),
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.completion_results (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null unique references public.guidance_targets (id) on delete cascade,
  reach_judgment public.reach_judgment,
  reach_method text,
  retest_score numeric,
  result public.completion_result not null default 'pending',
  committee_date date,
  decided_by uuid references public.teachers (id) on delete set null,
  decided_at timestamptz,
  neis_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.worksheets (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects (id) on delete set null,
  title text not null,
  standard_codes text[] not null default '{}',
  level text not null default 'basic' check (level in ('basic', 'standard')),
  causes public.cause_tag[] not null default '{}',
  content_md text not null,
  source text not null default 'ai' check (source in ('ai', 'manual')),
  created_by uuid references public.teachers (id) on delete set null default auth.uid(),
  is_shared boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers (id) on delete set null default auth.uid(),
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  est_cost_krw numeric not null default 0,
  created_at timestamptz not null default now()
);

create index on public.scores (assessment_item_id);
create index on public.enrollments (subject_id);
create index on public.guidance_targets (term_id, status);
create index on public.sessions (term_id, subject_id);
create index on public.session_attendance (student_id);
create index on public.ai_usage (created_at);

-- ── 권한 함수 ──
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teachers where id = auth.uid() and approved);
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teachers where id = auth.uid() and approved and role = 'admin');
$$;

-- 처음 가입한 사람은 담당자(admin)로 자동 승인, 그다음부터는 승인 대기 교사로 만든다.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  first_admin boolean;
begin
  select not exists (select 1 from public.teachers where role = 'admin') into first_admin;
  insert into public.teachers (id, email, display_name, role, approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    case when first_admin then 'admin'::public.teacher_role else 'teacher'::public.teacher_role end,
    first_admin
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger settings_updated before update on public.settings for each row execute function public.set_updated_at();
create trigger scores_updated before update on public.scores for each row execute function public.set_updated_at();
create trigger subject_attendance_updated before update on public.subject_attendance for each row execute function public.set_updated_at();
create trigger diagnoses_updated before update on public.diagnoses for each row execute function public.set_updated_at();
create trigger sessions_updated before update on public.sessions for each row execute function public.set_updated_at();
create trigger completion_results_updated before update on public.completion_results for each row execute function public.set_updated_at();

-- 대상자 상태는 후보 → 교과 확인 → 확정 순서로만 바뀐다(PRD 8.3). 확정은 담당자만.
create or replace function public.guard_target_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new; -- DB 관리 스크립트(가짜 데이터 넣기)
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'candidate' and not public.is_admin() then
      raise exception '새 대상자는 후보로만 만들 수 있어요.';
    end if;
    return new;
  end if;
  if new.status = old.status then
    return new;
  end if;
  if not (
    (old.status = 'candidate' and new.status in ('checked', 'excluded'))
    or (old.status = 'checked' and new.status in ('confirmed', 'excluded', 'candidate'))
    or (old.status = 'excluded' and new.status = 'candidate')
    or (old.status = 'confirmed' and new.status = 'checked')
  ) then
    raise exception '대상자 상태를 %에서 %(으)로 바로 바꿀 수 없어요.', old.status, new.status;
  end if;
  if (new.status = 'confirmed' or old.status = 'confirmed') and not public.is_admin() then
    raise exception '확정과 확정 취소는 담당자만 할 수 있어요.';
  end if;
  return new;
end $$;

create trigger guidance_targets_guard before insert or update on public.guidance_targets
  for each row execute function public.guard_target_status();

-- 이수·미이수 확정은 담당자만(PRD 8.3).
create or replace function public.guard_completion() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.result <> 'pending' and not public.is_admin() then
      raise exception '이수 확정은 담당자만 할 수 있어요.';
    end if;
  elsif new.result is distinct from old.result and not public.is_admin() then
    raise exception '이수 확정은 담당자만 할 수 있어요.';
  end if;
  return new;
end $$;

create trigger completion_results_guard before insert or update on public.completion_results
  for each row execute function public.guard_completion();

-- ── 행 수준 보안(RLS) ──
revoke all on all tables in schema public from anon;

alter table public.teachers enable row level security;
create policy teachers_select on public.teachers for select to authenticated using (public.is_approved() or id = auth.uid());
create policy teachers_update on public.teachers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy teachers_delete on public.teachers for delete to authenticated using (public.is_admin());

alter table public.terms enable row level security;
create policy terms_select on public.terms for select to authenticated using (public.is_approved());
create policy terms_insert on public.terms for insert to authenticated with check (public.is_admin());
create policy terms_update on public.terms for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy terms_delete on public.terms for delete to authenticated using (public.is_admin());

alter table public.settings enable row level security;
create policy settings_select on public.settings for select to authenticated using (public.is_approved());
create policy settings_insert on public.settings for insert to authenticated with check (public.is_admin());
create policy settings_update on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_delete on public.settings for delete to authenticated using (public.is_admin());

do $$
declare
  t text;
begin
  foreach t in array array[
    'subjects', 'achievement_standards', 'assessment_items', 'students', 'enrollments', 'scores',
    'subject_attendance', 'diagnoses', 'guidance_targets', 'completion_results', 'worksheets'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_approved())', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_approved())', t || '_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_approved()) with check (public.is_approved())', t || '_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_approved())', t || '_delete', t);
  end loop;
end $$;

alter table public.sessions enable row level security;
create policy sessions_select on public.sessions for select to authenticated using (public.is_approved());
create policy sessions_insert on public.sessions for insert to authenticated with check (public.is_approved());
create policy sessions_update on public.sessions for update to authenticated
  using (public.is_approved() and (teacher_id = auth.uid() or public.is_admin()))
  with check (public.is_approved() and (teacher_id = auth.uid() or public.is_admin()));
create policy sessions_delete on public.sessions for delete to authenticated
  using (public.is_approved() and (teacher_id = auth.uid() or public.is_admin()));

alter table public.session_attendance enable row level security;
create policy session_attendance_select on public.session_attendance for select to authenticated using (public.is_approved());
create policy session_attendance_write on public.session_attendance for all to authenticated
  using (public.is_approved() and (public.is_admin() or exists (select 1 from public.sessions s where s.id = session_id and s.teacher_id = auth.uid())))
  with check (public.is_approved() and (public.is_admin() or exists (select 1 from public.sessions s where s.id = session_id and s.teacher_id = auth.uid())));

alter table public.phrase_snippets enable row level security;
create policy phrase_snippets_own on public.phrase_snippets for all to authenticated
  using (public.is_approved() and teacher_id = auth.uid())
  with check (public.is_approved() and teacher_id = auth.uid());

alter table public.ai_usage enable row level security;
create policy ai_usage_select on public.ai_usage for select to authenticated using (public.is_approved());
create policy ai_usage_insert on public.ai_usage for insert to authenticated with check (public.is_approved() and teacher_id = auth.uid());
