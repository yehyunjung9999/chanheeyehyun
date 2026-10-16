-- 보장지도 매니저 · 가짜 데이터(목업과 같은 값). 실제 학생 정보가 아니다. (파트 0 소유)
-- 여러 번 실행해도 같은 결과가 되도록 고정 ID와 on conflict 를 쓴다.

-- 학기와 기준값
insert into public.terms (id, school_year, semester, starts_on, ends_on, prevention_start, prevention_end, remedial_start, remedial_end, school_council_approved, is_current)
values ('10000000-0000-4000-8000-000000000001', 2026, 1, '2026-03-02', '2026-08-14', '2026-04-01', '2026-07-03', '2026-07-06', '2026-08-14', true, true)
on conflict (id) do nothing;

insert into public.settings (term_id) values ('10000000-0000-4000-8000-000000000001')
on conflict (term_id) do nothing;

-- 과목 6개
insert into public.subjects (id, term_id, name, grade, department, credits, category, grading_scale, applies_achievement_rule, required_hours_override) values
  ('a0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '공통국어2', 1, null, 5, 'common', 'five', true, 15),
  ('a0000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '공통수학2', 1, null, 5, 'common', 'five', true, 15),
  ('a0000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '공통영어2', 1, null, 5, 'common', 'five', true, 15),
  ('a0000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '한국사2', 1, null, 5, 'common', 'five', true, 15),
  ('a0000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', '반려동물관리', 1, '반려동물과', 9, 'vocational', 'five', true, null),
  ('a0000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '식품위생', 1, '반려동물과', 3, 'vocational', 'five', false, null)
on conflict (id) do nothing;

-- 평가 항목: 과목마다 1회 지필 30%, 2회 지필 30%, 수행 40%, 진단평가(반영 안 함)
insert into public.assessment_items (subject_id, name, kind, max_score, weight_percent, counts_toward_final, sort_order)
select s.id, i.name, i.kind::public.assessment_kind, 100, i.weight, i.final, i.ord
from public.subjects s
cross join (values
  ('진단평가', 'diagnostic', 0, false, 0),
  ('1회 지필', 'exam', 30, true, 1),
  ('2회 지필', 'exam', 30, true, 2),
  ('수행평가', 'performance', 40, true, 3)
) as i(name, kind, weight, final, ord)
where s.term_id = '10000000-0000-4000-8000-000000000001'
  and not exists (select 1 from public.assessment_items x where x.subject_id = s.id and x.name = i.name);

-- 성취기준(예시 코드)
insert into public.achievement_standards (subject_id, code, description, sort_order) values
  ('a0000000-0000-4000-8000-000000000001', '[예시-국-01]', '글의 구조 파악하기', 1),
  ('a0000000-0000-4000-8000-000000000001', '[예시-국-02]', '중심 내용 요약하기', 2),
  ('a0000000-0000-4000-8000-000000000001', '[예시-국-03]', '상황에 맞게 말하기', 3),
  ('a0000000-0000-4000-8000-000000000001', '[예시-국-04]', '문학 작품의 맥락 이해', 4),
  ('a0000000-0000-4000-8000-000000000002', '[예시-수-01]', '집합의 연산', 1),
  ('a0000000-0000-4000-8000-000000000002', '[예시-수-02]', '명제와 조건', 2),
  ('a0000000-0000-4000-8000-000000000002', '[예시-수-03]', '함수의 뜻', 3),
  ('a0000000-0000-4000-8000-000000000003', '[예시-영-01]', '글의 요지 파악', 1),
  ('a0000000-0000-4000-8000-000000000003', '[예시-영-02]', '세부 정보 찾기', 2),
  ('a0000000-0000-4000-8000-000000000004', '[예시-사-01]', '근대 국가 수립 운동', 1),
  ('a0000000-0000-4000-8000-000000000004', '[예시-사-02]', '일제 강점기 민족 운동', 2),
  ('a0000000-0000-4000-8000-000000000005', '[예시-반려-01]', '반려견 기본 관리', 1),
  ('a0000000-0000-4000-8000-000000000005', '[예시-반려-02]', '위생·건강 점검', 2),
  ('a0000000-0000-4000-8000-000000000006', '[예시-식품-01]', '식품 위생 법규', 1)
on conflict (subject_id, code) do nothing;

-- 가짜 학생: 1학년 1~3반 각 20명 + 목업 학번 2명(10227, 10321). 이름은 저장하지 않는다.
insert into public.students (school_year, student_no, grade, class_no, number, department)
select 2026, '1' || lpad(c::text, 2, '0') || lpad(n::text, 2, '0'), 1, c, n,
       case when c = 3 then '반려동물과' else '조리과' end
from generate_series(1, 3) c, generate_series(1, 20) n
on conflict (school_year, student_no) do nothing;

insert into public.students (school_year, student_no, grade, class_no, number, department) values
  (2026, '10227', 1, 2, 27, '조리과'),
  (2026, '10321', 1, 3, 21, '반려동물과')
on conflict (school_year, student_no) do nothing;

update public.students set special_handling = 'substitutable', alt_program_done = true
where school_year = 2026 and student_no = '10220';

-- 수강 편성: 모두 공통 4과목, 3반은 전문교과 2과목도
insert into public.enrollments (student_id, subject_id)
select st.id, s.id
from public.students st
join public.subjects s on s.term_id = '10000000-0000-4000-8000-000000000001'
where st.school_year = 2026
  and (s.category = 'common' or st.class_no = 3)
on conflict do nothing;

-- 목업의 위험군 학생 점수(세 항목 모두 같은 값 → 합계가 그 값이 된다)와 결과 횟수
drop table if exists pg_temp.seed_risk;
create temporary table seed_risk (student_no text, subject_id uuid, total numeric, absences numeric);
insert into seed_risk values
  ('10103', 'a0000000-0000-4000-8000-000000000001', 36.40, 2),
  ('10107', 'a0000000-0000-4000-8000-000000000001', 39.60, 1),
  ('10115', 'a0000000-0000-4000-8000-000000000001', 31.25, 4),
  ('10118', 'a0000000-0000-4000-8000-000000000001', 47.80, 0),
  ('10227', 'a0000000-0000-4000-8000-000000000001', 41.00, 0),
  ('10204', 'a0000000-0000-4000-8000-000000000002', 52.10, 21),
  ('10207', 'a0000000-0000-4000-8000-000000000002', 38.20, 3),
  ('10212', 'a0000000-0000-4000-8000-000000000002', 64.00, 1),
  ('10211', 'a0000000-0000-4000-8000-000000000003', 33.10, 2),
  ('10220', 'a0000000-0000-4000-8000-000000000003', 28.50, 0),
  ('10302', 'a0000000-0000-4000-8000-000000000004', 25.00, 6),
  ('10305', 'a0000000-0000-4000-8000-000000000004', 44.49, 2),
  ('10309', 'a0000000-0000-4000-8000-000000000004', 37.00, 1),
  ('10312', 'a0000000-0000-4000-8000-000000000005', 35.00, 10),
  ('10316', 'a0000000-0000-4000-8000-000000000005', 71.30, 3),
  ('10321', 'a0000000-0000-4000-8000-000000000006', 39.49, 2);

-- 모든 수강 학생 점수: 목업 학생은 위 값, 나머지는 55~94점(정상)
insert into public.scores (student_id, assessment_item_id, score)
select e.student_id, ai.id,
       coalesce(r.total, 55 + ((st.student_no::int * 7 + ai.sort_order * 3 + get_byte(decode(md5(s.name), 'hex'), 0)) % 40))
from public.enrollments e
join public.students st on st.id = e.student_id
join public.subjects s on s.id = e.subject_id
join public.assessment_items ai on ai.subject_id = s.id and ai.counts_toward_final
left join seed_risk r on r.student_no = st.student_no and r.subject_id = s.id
where s.term_id = '10000000-0000-4000-8000-000000000001'
on conflict (student_id, assessment_item_id) do nothing;

insert into public.subject_attendance (student_id, subject_id, absences, as_of)
select e.student_id, e.subject_id, coalesce(r.absences, st.student_no::int % 3), '2026-07-24'
from public.enrollments e
join public.students st on st.id = e.student_id
left join seed_risk r on r.student_no = st.student_no and r.subject_id = e.subject_id
on conflict (student_id, subject_id) do nothing;

-- 보장지도 대상자 10건(확정 6, 교과 확인 1, 후보 2, 제외 1)
insert into public.guidance_targets (id, term_id, student_id, subject_id, kind, status, reason, projected_score, excluded_reason, consent_received)
select v.id::uuid, '10000000-0000-4000-8000-000000000001', st.id, v.subject_id::uuid, v.kind::public.target_kind, v.status::public.target_status, v.reason, v.score, v.excluded, v.consent
from (values
  ('c0000000-0000-4000-8000-000000000001', '10103', 'a0000000-0000-4000-8000-000000000001', 'remedial', 'confirmed', '원점수 36', 36, null, true),
  ('c0000000-0000-4000-8000-000000000002', '10115', 'a0000000-0000-4000-8000-000000000001', 'remedial', 'confirmed', '원점수 31', 31, null, true),
  ('c0000000-0000-4000-8000-000000000003', '10207', 'a0000000-0000-4000-8000-000000000002', 'remedial', 'confirmed', '원점수 38', 38, null, true),
  ('c0000000-0000-4000-8000-000000000004', '10312', 'a0000000-0000-4000-8000-000000000005', 'remedial', 'confirmed', '원점수 35', 35, null, false),
  ('c0000000-0000-4000-8000-000000000005', '10220', 'a0000000-0000-4000-8000-000000000003', 'remedial', 'confirmed', '원점수 29', 29, null, true),
  ('c0000000-0000-4000-8000-000000000006', '10204', 'a0000000-0000-4000-8000-000000000002', 'attendance', 'confirmed', '결과 21회 > 20회', null, null, true),
  ('c0000000-0000-4000-8000-000000000007', '10211', 'a0000000-0000-4000-8000-000000000003', 'remedial', 'checked', '원점수 33', 33, null, false),
  ('c0000000-0000-4000-8000-000000000008', '10302', 'a0000000-0000-4000-8000-000000000004', 'remedial', 'candidate', '원점수 25', 25, null, false),
  ('c0000000-0000-4000-8000-000000000009', '10309', 'a0000000-0000-4000-8000-000000000004', 'remedial', 'candidate', '원점수 37', 37, null, false),
  ('c0000000-0000-4000-8000-000000000010', '10227', 'a0000000-0000-4000-8000-000000000001', 'remedial', 'excluded', '원점수 38', 38, '성적 정정으로 원점수 41 재산출', false)
) as v(id, student_no, subject_id, kind, status, reason, score, excluded, consent)
join public.students st on st.school_year = 2026 and st.student_no = v.student_no
on conflict (id) do nothing;

-- 운영 일지 12건(목업과 같은 날짜·시수·출석). 작성 교사는 비워 둔다(예시 데이터).
insert into public.sessions (id, term_id, subject_id, kind, method, held_on, period_label, hours, content, teacher_id) values
  ('d0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'prevention', 'face_to_face', '2026-04-14', '7교시', 3, '글의 구조 파악하기 기초 다지기', null),
  ('d0000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'prevention', 'assignment', '2026-04-21', '방과후', 3, '요약하기 보충과제', null),
  ('d0000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'prevention', 'online_content', '2026-05-12', '방과후', 3, 'EBSi 공통국어 독서 강좌 수강', null),
  ('d0000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'remedial', 'face_to_face', '2026-07-15', '7교시', 2, '문단 중심 내용 찾기, 짧은 글 요약 연습', null),
  ('d0000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'remedial', 'assignment', '2026-07-17', '방과후', 3, '보충 활동지 2장(글의 구조) 풀고 피드백', null),
  ('d0000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'remedial', 'online_content', '2026-07-16', '방과후', 4, 'EBSi 공통수학 집합·명제 강좌', null),
  ('d0000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'prevention', 'after_school', '2026-05-06', '방과후', 4, '방정식 기초 복습', null),
  ('d0000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'attendance', 'face_to_face', '2026-07-20', '7교시', 2, '결손 차시 내용 대면 보충', null),
  ('d0000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'attendance', 'assignment', '2026-07-22', '방과후', 4, '결손 차시 과제 2회분', null),
  ('d0000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'remedial', 'face_to_face', '2026-07-21', '6교시', 2, '반려견 기본 관리 절차 복습', null),
  ('d0000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'remedial', 'in_class', '2026-07-23', '실습실', 6, '실습: 위생 관리·건강 체크 단계별 지도', null),
  ('d0000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000001', null, 'emotional_common', 'emotional', '2026-07-10', '1~6교시', 6, '기초학습역량강화 캠프(학교 공통 정서 지원)', null)
on conflict (id) do nothing;

insert into public.session_attendance (session_id, student_id, status, credited_hours)
select v.session_id::uuid, st.id, v.status::public.attendance_status,
       case when v.status = 'absent' then 0 else s.hours end
from (values
  ('d0000000-0000-4000-8000-000000000001', '10103', 'present'), ('d0000000-0000-4000-8000-000000000001', '10115', 'present'), ('d0000000-0000-4000-8000-000000000001', '10107', 'present'),
  ('d0000000-0000-4000-8000-000000000002', '10103', 'present'), ('d0000000-0000-4000-8000-000000000002', '10115', 'absent'),
  ('d0000000-0000-4000-8000-000000000003', '10103', 'present'), ('d0000000-0000-4000-8000-000000000003', '10115', 'present'),
  ('d0000000-0000-4000-8000-000000000004', '10103', 'present'), ('d0000000-0000-4000-8000-000000000004', '10115', 'present'),
  ('d0000000-0000-4000-8000-000000000005', '10103', 'present'), ('d0000000-0000-4000-8000-000000000005', '10115', 'absent'),
  ('d0000000-0000-4000-8000-000000000006', '10207', 'present'),
  ('d0000000-0000-4000-8000-000000000007', '10207', 'present'),
  ('d0000000-0000-4000-8000-000000000008', '10204', 'present'),
  ('d0000000-0000-4000-8000-000000000009', '10204', 'present'),
  ('d0000000-0000-4000-8000-000000000010', '10312', 'present'),
  ('d0000000-0000-4000-8000-000000000011', '10312', 'present'),
  ('d0000000-0000-4000-8000-000000000012', '10103', 'present'), ('d0000000-0000-4000-8000-000000000012', '10207', 'present'),
  ('d0000000-0000-4000-8000-000000000012', '10204', 'present'), ('d0000000-0000-4000-8000-000000000012', '10312', 'present'),
  ('d0000000-0000-4000-8000-000000000012', '10115', 'absent')
) as v(session_id, student_no, status)
join public.students st on st.school_year = 2026 and st.student_no = v.student_no
join public.sessions s on s.id = v.session_id::uuid
on conflict (session_id, student_id) do nothing;

-- 도달 판정: 10103(공통국어2)만 '도달'
insert into public.completion_results (target_id, reach_judgment, reach_method)
values ('c0000000-0000-4000-8000-000000000001', 'reached', '보충과제 평가')
on conflict (target_id) do nothing;

drop table if exists pg_temp.seed_risk;
