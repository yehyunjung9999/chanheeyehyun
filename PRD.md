# PRD — 보장지도 매니저 (직업계고 최소 성취수준 보장지도 종합 매니저)

| 항목 | 내용 |
|---|---|
| 문서 버전 | **v2.0 (2026-10-16)**: 목업 확정 반영, "각자 컴퓨터에서 끝까지 만든 뒤 마지막에 한 번 합치기" 방식, 초보자 협업 가이드(제1부) 추가 |
| 상태 | 확정(개발 착수 전) |
| 화면 기준 | `mockup/index.html` (목업, 고칠 점 없음으로 확정). 저장소에서는 `docs/mockup/index.html` |
| 업무 기준 | 충남교육청 「2026 고등학교 학업성적관리 시행지침」, 학교 「2025 최소 성취수준 보장지도 기본 계획」(참고) |
| 보안 기준 | **dorms-check**(github.com/shinnanchanguk/dorms-check) 통과(제2부 13장) |
| 만드는 사람 | 선생님 2명. **A 선생님 = 파트 A**, **B 선생님 = 파트 B**. 각자 자기 컴퓨터에서 자기 AI로 만들고 GitHub에서 합친다. |

> **이 문서는 두 부분으로 되어 있어요.**
> - **제1부, 선생님용 가이드**: 두 선생님이 먼저 읽어요. 누가 무엇을 어떤 순서로 하는지, 어떻게 합치는지 적혀 있어요.
> - **제2부, 제품 명세**: AI가 읽고 그대로 만드는 설계서예요. 선생님은 필요할 때만 보면 돼요.

---

# 제1부 · 선생님용 가이드

## G1. 한눈에 보기

```
[1주차]      A: 준비 + 파트 0(공통 기반) 만들어서 GitHub에 올림 ──┐
                                                           │ "준비 끝" 알림
[2~5주차]    A: 내 컴퓨터에서 파트 A 끝까지          B: 내 컴퓨터에서 파트 B 끝까지
             (매일 저녁 GitHub에 백업)                  (매일 저녁 GitHub에 백업)
                                                           │
[6주차]      ① A가 먼저 합침 → ② B가 A 것을 받아 자기 것과 합침 → ③ B가 합침
             ④ 둘이 같이 "통합 시험" → ⑤ 인터넷 주소로 배포 → ⑥ dorms-check 점검
```

| | A 선생님 | B 선생님 |
|---|---|---|
| 맡는 일 | **대상자를 찾는다**: 설정, 과목·학생, 성적 올리기, 위험군 판별, 대상자 선정, AI 활동지, 전교 현황 | **지도하고 이수시킨다**: 운영 일지★, 시수 계산★, 진행 현황, 이수 판정, 출력물 |
| 먼저 할 일 | 파트 0(공통 기반) 만들기 | A가 파트 0을 끝낼 때까지 준비물 설치 |
| 작업 브랜치 | `part-a` | `part-b` |
| 고쳐도 되는 폴더 | `src/app/(a)`, `src/lib/a` 등 (제2부 6.2) | `src/app/(b)`, `src/lib/b` 등 (제2부 6.2) |
| 합치는 순서 | **첫 번째** | **두 번째** |
| 계정 | GitHub, Supabase, Vercel, Claude API | GitHub (Supabase 접속 정보는 A에게 받음) |

**용어 세 가지만 알면 돼요**
- **저장소(repository)**: GitHub에 있는 프로젝트 폴더예요. 두 분이 같은 저장소를 씁니다.
- **브랜치(branch)**: 저장소 안의 "내 작업 공간"이에요. A는 `part-a`, B는 `part-b`에서만 작업하고, 완성본은 `main`에 모아요.
- **풀 리퀘스트(PR)와 합치기(merge)**: 내 브랜치를 `main`에 합쳐 달라는 요청과, 그걸 실제로 합치는 버튼이에요.

> 💡 git 명령어를 외울 필요는 없어요. **각자의 AI에게 아래 "AI에게 이렇게 말하세요" 문장을 그대로 붙여 넣으면** AI가 대신 해요. 사람이 직접 하는 건 GitHub 웹사이트에서 버튼 몇 개 누르는 것뿐이에요.

## G2. 준비물 (두 분 모두, 30분)

각자 자기 컴퓨터에 설치해요. 다 "다음"만 누르면 돼요.

1. **Node.js (LTS 버전)**: https://nodejs.org 에서 왼쪽 **LTS** 버튼을 눌러 받아 설치해요. 웹앱을 내 컴퓨터에서 돌리는 프로그램이에요.
2. **Git**: https://git-scm.com 에서 **Download for Windows**를 눌러 설치해요. 작업 기록을 관리하는 프로그램이에요.
3. **AI 도구**: Claude 데스크톱 앱(Code 탭) 같은, 내 컴퓨터 폴더를 열고 명령을 실행할 수 있는 AI
4. **GitHub 계정**: B 선생님도 있어야 해요.
5. (선택) **GitHub Desktop**: https://desktop.github.com. 지금 어느 브랜치에 있는지 눈으로 보기 쉬워요.

설치가 끝나면 AI에게 확인을 맡겨요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> node -v, npm -v, git --version 을 실행해서 설치가 잘 됐는지 확인해 줘.
> 그리고 git에 내 이름과 이메일을 설정해 줘. 이름은 ○○○, 이메일은 내 GitHub 이메일이야.
> ```

## G3. A 선생님이 할 일 (순서대로)

### A-1. 저장소 만들고 B 초대하기 (첫날, 20분)
1. https://github.com 에 로그인하고 오른쪽 위 **＋ → New repository**를 눌러요.
2. 이름은 `bojang-manager`로 하고, **Private(비공개)** 를 고른 뒤 **Create repository**를 눌러요.
3. 저장소 화면에서 **Settings → Collaborators → Add people**을 누르고 B 선생님의 GitHub 아이디를 넣어 초대해요.
4. B 선생님에게 "초대 메일 확인해서 수락해 주세요"라고 알려요.

### A-2. 파트 0(공통 기반) 만들기 (1주)
1. 내 컴퓨터에 작업 폴더를 하나 만들어요. 예: `문서\bojang-manager`
2. 이 PRD 파일과 `mockup` 폴더를 그 폴더에 넣어요.
3. AI 도구에서 그 폴더를 열고 아래처럼 지시해요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> 이 폴더의 PRD.md를 끝까지 읽어 줘. 너는 "파트 0(공통 기반)"을 만드는 담당이야.
> PRD 제2부 9장의 할 일을 순서대로 해 줘. 화면 모양은 mockup/index.html을 기준으로 해.
> GitHub 저장소 주소는 https://github.com/<내 아이디>/bojang-manager 야. 완성되면 main 브랜치에 올려 줘.
> Supabase 프로젝트 만들기, Google 로그인 설정, Vercel 연결처럼 내가 웹사이트에서 직접 눌러야 하는 건
> 한 단계씩 어디를 누르면 되는지 알려 줘.
> ```

4. AI가 웹사이트에서 직접 하라고 하는 일은 안내대로 따라 해요. 예: Supabase 새 프로젝트(리전 **Seoul**), 키 복사, Vercel 연결
5. 파트 0이 끝났는지는 제2부 9장의 **완료 기준**으로 확인해요. 로그인이 되고, 메뉴에 빈 화면이 보이고, 가짜 데이터가 보이면 돼요.

### A-3. B 선생님에게 넘겨주기 (30분)
1. B 선생님에게 **"파트 0 끝났어요"** 라고 알려요.
2. B 선생님에게 **Supabase 접속 정보 2개**를 전달해요.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 이 두 개는 원래 브라우저에 공개되는 값이라 학교 메신저로 보내도 괜찮아요.
3. **`DATABASE_URL`(DB 비밀번호)과 `ANTHROPIC_API_KEY`는 절대 보내지 않아요.** B 선생님 작업에는 필요 없어요.
4. B 선생님이 처음 로그인하면 승인해 줘요. 아직 교사 승인 화면(A2)을 만들기 전이라 Supabase에서 직접 해요.
   - Supabase 웹 → **Table Editor → teachers** → B 선생님 줄의 `approved`를 `true`로 바꾸고 저장
   - 역할을 교과 교사로 시험하려면 `role`은 `teacher`로 둬요.

### A-4. 파트 A 만들기 (3~4주)
1. 작업 브랜치를 만들어요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> main에서 part-a 브랜치를 만들고 그 브랜치로 옮겨 줘. 앞으로 모든 작업은 part-a에서만 해.
> ```

2. 그다음 **제2부 부록 A의 "파트 A 첫 지시문"** 을 그대로 붙여 넣어요.
3. 기능을 **A1 → A2 → … → A9 순서로 하나씩** 만들어요. 한 기능이 끝날 때마다 아래를 반복해요.
   - AI에게 "**npm run dev 실행해 줘**"라고 하고, 브라우저에서 `http://localhost:3000`을 열어 화면을 확인해요.
   - 목업(`docs/mockup/index.html`)과 비교해서 다르면 AI에게 말해요.
   - 제2부 10장의 **완료 기준**을 AI에게 확인시켜요: "A3 완료 기준을 하나씩 확인해 줘"
   - "**지금까지 한 것 커밋해 줘**"라고 말해요.
4. **매일 작업이 끝나면 백업**해요(합치기가 아니에요).

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> 오늘 작업을 커밋하고 GitHub의 part-a 브랜치에 올려 줘(push). main에는 올리지 마.
> ```

### A-5. 합치기와 마무리 (6주차)
G5를 따라 해요. **A 선생님이 먼저** 합쳐요.

## G4. B 선생님이 할 일 (순서대로)

### B-1. 기다리는 동안 준비 (1주차)
1. G2 준비물을 설치해요.
2. GitHub 초대 메일에서 **Accept invitation**을 눌러요. 메일이 안 보이면 https://github.com/notifications 를 확인해요.
3. 목업(`mockup/index.html`)에서 **운영 일지, 진행 현황, 이수 판정, 출력물** 화면을 미리 눌러 보세요. B 선생님이 만들 화면이에요.
4. 학교에서 쓰는 출석부, 결과 보고서 양식이 있으면 모아 두세요(B5에 씀).

### B-2. 내 컴퓨터로 받아 오기 (A의 "파트 0 끝" 연락 후, 30분)
1. `문서` 폴더를 AI 도구에서 열어요.
2. 아래처럼 지시해요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> https://github.com/<A 선생님 아이디>/bojang-manager 저장소를 이 폴더에 받아 줘(clone).
> 받은 폴더로 옮긴 다음, .env.example을 복사해서 .env.local을 만들고
> NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY에 내가 주는 값을 넣어 줘.
> 그리고 npm install 하고 npm run dev로 실행해 줘.
> ```

3. AI가 값을 물어보면 A 선생님에게 받은 두 값을 붙여 넣어요.
4. 브라우저에서 `http://localhost:3000`을 열고 구글로 로그인해요.
5. "승인 대기 중"이 보이면 A 선생님에게 승인해 달라고 해요(A-3의 4번).

### B-3. 파트 B 만들기 (3~4주)
1. 작업 브랜치를 만들어요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> main에서 part-b 브랜치를 만들고 그 브랜치로 옮겨 줘. 앞으로 모든 작업은 part-b에서만 해.
> ```

2. **제2부 부록 A의 "파트 B 첫 지시문"** 을 그대로 붙여 넣어요.
3. **B1(운영 일지) → B2(시수 계산) → B3 → B4 → B5 순서로 하나씩** 만들어요. B1과 B2가 가장 중요해요.
   - 대상자 화면(파트 A)이 아직 없어도 괜찮아요. 파트 0이 넣어 둔 **가짜 확정 대상자**로 만들면 돼요.
   - 한 기능이 끝날 때마다 `localhost:3000`에서 목업과 비교하고, 완료 기준을 확인하고, 커밋해요(G3 A-4의 3번과 같아요).
   - 운영 일지는 **휴대폰에서도** 확인해요. AI에게 "휴대폰으로 볼 수 있게 같은 와이파이 주소를 알려 줘"라고 하거나, 브라우저 창을 좁혀 보세요.
4. 매일 작업이 끝나면 백업해요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> 오늘 작업을 커밋하고 GitHub의 part-b 브랜치에 올려 줘(push). main에는 올리지 마.
> ```

### B-4. 합치기와 마무리 (6주차)
G5를 따라 해요. **A 선생님이 먼저 합친 다음에** B 선생님 차례예요.

## G5. 마지막 합치기 (6주차, 같이 시간 맞춰서 2~3시간)

> 순서가 중요해요: **① A 마무리·합치기 → ② B가 A 결과 받아 오기 → ③ B 합치기 → ④ 같이 확인**

### ① A 선생님: 마무리하고 먼저 합치기
1. 마무리를 지시해요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> 파트 A 작업을 마무리하자. PRD 10장의 모든 완료 기준을 확인해서 표로 보여 줘.
> npm run build와 npm test가 통과하는지 확인하고, 커밋하고 part-a를 GitHub에 올려 줘.
> ```

2. GitHub 저장소 페이지를 열면 노란 띠에 **Compare & pull request**가 보여요. 눌러요.
   - 안 보이면 **Pull requests → New pull request**를 누르고 `base: main` ← `compare: part-a`를 골라요.
3. 제목에 `파트 A`라고 쓰고 **Create pull request**를 눌러요.
4. 아래로 내려 **Merge pull request → Confirm merge**를 눌러요. 초록 "Merged" 표시가 나오면 끝이에요.
5. B 선생님에게 **"A 합쳤어요"** 라고 알려요.

### ② B 선생님: A 결과를 내 브랜치로 받아 오기
1. 받아 오기를 지시해요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> 지금까지 한 작업을 먼저 커밋해 줘. 그다음 GitHub의 main을 내 part-b 브랜치로 합쳐 줘(git pull origin main).
> 충돌(conflict)이 나면 PRD 6.2 소유권 표대로 해결해 줘:
> - 파트 B 파일은 내 쪽(part-b)을 남기고
> - 파트 A 파일과 파트 0(공통) 파일은 main 쪽을 남겨.
> - package-lock.json이 충돌하면 npm install로 다시 만들어 줘.
> 해결한 파일 목록과 이유를 설명해 주고, npm run build와 npm test를 돌려 줘.
> ```

2. `npm run dev`로 실행해서 **G6 통합 시험 1~4번**을 내 컴퓨터에서 먼저 해 봐요.
3. 문제가 없으면 커밋하고 올리라고 지시해요.

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> 합친 결과를 커밋하고 part-b를 GitHub에 올려 줘.
> ```

### ③ B 선생님: 합치기
1. GitHub에서 **Compare & pull request**를 눌러요(`base: main` ← `compare: part-b`).
2. 제목에 `파트 B`라고 쓰고 **Create pull request**를 눌러요.
3. "This branch has no conflicts"(충돌 없음)가 보이면 **Merge pull request → Confirm merge**를 눌러요.
   - "conflicts"(충돌)가 보이면 누르지 말고 ②의 AI 지시를 다시 해요.

### ④ 같이 확인하고 배포하기
1. A 선생님 컴퓨터에서 AI에게 이렇게 말해요. "main을 받아 오고(git checkout main, git pull) npm install, npm run dev 해 줘"
2. **G6 통합 시험**을 두 분이 함께 해요.
3. Vercel은 `main`이 바뀌면 자동으로 인터넷 주소에 올려요. Vercel 웹에서 **Deployments**가 초록 "Ready"인지 확인해요.
4. A 선생님 AI에게 **dorms-check 점검**을 맡겨요(제2부 13.5).

> 🗣️ **AI에게 이렇게 말하세요**
> ```
> /dorms-check 로 배포 주소 https://<배포주소>.vercel.app 을 점검하고, 차단 항목과 고칠 점을 쉬운 말로 알려 줘.
> ```

5. 고칠 점이 나오면 **새 브랜치** `fix-<내용>`에서 고치고, 같은 방식으로 PR → 합치기 해요.

## G6. 통합 시험 체크리스트 (합친 뒤 같이)

가짜 데이터로, 한 사람은 **담당자(admin)**, 한 사람은 **교과 교사(teacher)** 계정으로 해요.

| # | 누가 | 할 일 | 이렇게 되면 통과 |
|---|---|---|---|
| 1 | 담당자 | 학기·기준값 설정 열기 | 기본값(1학점당 3시수, 2/3, 대면 1시수, 예방·정서 50%)이 보임 |
| 2 | 담당자 | 성적·출결 올리기에서 앱 양식으로 업로드 | 오류 행이 빨갛게 표시되고, 나머지만 저장됨 |
| 3 | 담당자 | 위험군 판별 열기 | 39.60 → 40(대상 아님), 39.49 → 39(대상)로 판정 |
| 4 | 담당자 | 대상자 선정에서 후보 만들기 | 후보가 생기고, 바로 확정 버튼은 없음 |
| 5 | 교과 교사 | 자기 과목 후보를 "교과 확인" | 교과 확인 탭으로 이동 |
| 6 | 담당자 | "확정" | 확정·지도 중 탭으로 이동 |
| 7 | 교과 교사 | **휴대폰으로** 운영 일지 쓰기(대면, 2시수) | 30초 안에 저장됨 |
| 8 | 교과 교사 | 진행 현황 | 방금 학생의 인정 시수가 2 늘고 경고가 바뀜 |
| 9 | 교과 교사 | 이수 판정에서 도달 판정 "도달" | 상태가 "이수 가능"으로 바뀜 |
| 10 | 담당자 | 학관위 심의일 넣고 "이수 가능 n명 확정" | 성취도 E·비고 적지 않음 표시 |
| 11 | 담당자 | 출력물 → 출석부, 나이스 명단 | A4 미리보기가 나오고 PDF로 저장됨 |
| 12 | 담당자 | 전교 현황 | 숫자가 위 결과와 맞음(이수 가능 수 등) |
| 13 | 아무나 | 명렬표 불러오기 | 학번 옆에 이름이 나오고, 다른 컴퓨터에서는 안 보임 |
| 14 | 담당자 | AI 보충 활동지 만들기 | 초안이 나오고, 사용량이 올라감 |
| 15 | 담당자 | dorms-check 점검 | 차단 항목 0건 |

## G7. 막혔을 때

| 상황 | 이렇게 하세요 |
|---|---|
| "충돌(conflict)이 났어요" | AI에게 G5 ②의 지시문을 다시 붙여 넣어요. 파일 주인 기준(6.2)으로 해결해요. |
| "빌드가 실패해요"(빨간 오류) | 오류 글을 **전부 복사**해서 AI에게 붙여 넣고 "이 오류 고쳐 줘. 내 파트 파일만 고쳐"라고 해요. |
| "로그인이 안 돼요" | ① 승인됐는지(A-3의 4번) ② `.env.local` 값이 맞는지 ③ Supabase 로그인 설정에 `http://localhost:3000`이 있는지 AI에게 확인시켜요. |
| "실수로 상대 파트 파일을 고쳤어요" | AI에게 "PRD 6.2 기준으로 내 파트가 아닌 파일의 변경을 main 상태로 되돌려 줘"라고 해요. |
| "push가 거절됐대요(rejected)" | AI에게 "내 브랜치를 GitHub에서 먼저 받아 오고(pull) 다시 올려 줘"라고 해요. |
| "공통 파일을 꼭 바꿔야 해요" | 6.4 공통 변경 요청 절차를 따라요. 혼자 바꾸지 않아요. |
| "키를 실수로 GitHub에 올렸어요" | **바로** 그 키를 재발급해요(Supabase·Anthropic 웹). 그다음 AI에게 "올라간 키를 저장소 기록에서 지우는 방법을 알려 줘"라고 해요. |
| "어디까지 했는지 모르겠어요" | AI에게 "PRD 10장(또는 11장) 기준으로 완료/미완료 표를 만들어 줘"라고 해요. |
| "목업과 화면이 달라요" | AI에게 "docs/mockup/index.html의 ○○ 화면과 똑같이 맞춰 줘"라고 해요. |

## G8. 절대 하지 말 것
1. `main`에 직접 올리기(push). 합치기는 GitHub의 PR 버튼으로만 해요.
2. 상대 파트 폴더나 공통 파일(파트 0) 고치기
3. `.env.local` 파일을 GitHub에 올리기. 서비스 키나 AI 키를 채팅·메일에 붙여 넣기
4. **실제 학생 정보 넣기.** 합친 뒤 점검과 학교 승인이 끝날 때까지는 가짜 데이터만 써요.
5. 상대에게 말하지 않고 새 프로그램(npm 패키지) 추가하기
6. `supabase/migrations/0001_init.sql` 고치기

---

# 제2부 · 제품 명세 (AI가 읽고 만드는 설계서)

> **AI에게**: 전체를 읽되 **6장(소유권)·7장(데이터)·8장(파트 간 약속)·13장(보안)은 절대 규칙**이에요. 자기 파트 장(10장 또는 11장)만 구현하고, 다른 파트 파일은 수정하지 않아요. 화면 배치와 문구는 `docs/mockup/index.html`을 기준으로 해요.

## 1. 개요

### 1.1 배경
- 2026학년도부터 1·2학년 **공통과목**은 학업성취율 40% 미만이면 최소 성취수준 보장지도를 이수해야 학점을 받는다. **모든 과목**은 출석률 2/3 미만이면 추가 학습을 해야 한다.
- 지금은 대상자 찾기, 시수 세기, 이수 판정, 학관위 자료, 나이스 입력을 엑셀·한글·종이 출석부로 손으로 한다.

### 1.2 목표
1. 위험군을 **자동으로** 찾고, 원인을 진단한다.
2. 교과 교사가 **운영 일지를 30초 안에** 쓰면, 시수와 이수 가능 여부가 **자동으로** 계산된다(최우선).
3. 학관위 자료, 출석부, 동의서, 나이스 입력 명단, 결과 보고서를 **버튼 한 번으로** 출력한다.
4. 미도달 학생용 보충 활동지를 **AI로 빠르게** 만든다.

### 1.3 성공 기준
- 담당자가 한 학기 보장지도 업무(대상자 선정 → 이수 확정 → 보고)를 이 앱 하나로 끝낸다.
- 교과 교사 1회 일지 입력 30초 이하(휴대폰 포함).
- 시수·이수 판정이 12장 테스트 케이스와 100% 일치한다.
- 서버에 학생 이름이 0건 저장된다.
- dorms-check 차단(gate) 항목 0건, 보안 권고 항목 통과, 에듀집 9개 항목 근거가 갖춰진다.

## 2. 사용자와 권한

| 역할 | 누구 | 할 수 있는 일 |
|---|---|---|
| `admin` (담당자) | 최소성취수준 업무 담당 교사 | 모든 기능, 기준값 설정, 교사 승인, 대상자 확정, 이수 확정 |
| `teacher` (교과 교사) | 과목 담당 교사 | 자기 과목 성적 입력, 대상자 교과 확인, 운영 일지, 도달 판정, 활동지 생성 |
| 승인 대기 | 처음 로그인한 교사 | "승인 대기 중" 화면만 봄 |

- 로그인은 **Google 계정**(Supabase Auth)이다. 개발 중에는 이메일 로그인 링크를 먼저 쓴다(구글 설정 전).
- **맨 처음 가입한 사람은 자동으로 담당자(admin)로 승인**된다(파트 0의 DB 트리거). 그다음부터는 `approved=false`로 생기고 담당자가 승인한다(A2 전에는 Supabase Table Editor에서 직접).
- 보장지도는 **과목 담당교사가 직접 지도**하는 것이 원칙이다(학교 계획 3).
- 목업의 "보기(담당자/교과 교사)" 전환과 "파트 표시" 버튼은 **목업 설명용**이다. 실제 앱은 로그인한 계정의 역할로 화면이 정해진다.

## 3. 화면 목록 (목업 기준)

| 메뉴 그룹 | 화면 | 주소 | 파트 | 목업 |
|---|---|---|---|---|
| 한눈에 | 전교 현황 | `/dashboard` | A9 | 있음 |
| 대상자를 찾는다 | 과목·평가 계획 | `/subjects`, `/subjects/[id]` | A3 | 생략(이 문서 기준) |
| 대상자를 찾는다 | 학생·수강 편성 | `/students` | A4 | 생략(이 문서 기준) |
| 대상자를 찾는다 | 성적·출결 올리기 | `/scores` | A5 | 있음 |
| 대상자를 찾는다 | 위험군 판별·진단 | `/risk` | A6 | 있음 |
| 대상자를 찾는다 | 대상자 선정 | `/targets` | A7 | 있음 |
| 대상자를 찾는다 | AI 보충 활동지 | `/worksheets` | A8 | 있음 |
| 지도하고 이수시킨다 | ★ 운영 일지 쓰기 | `/journal`, `/journal/new`, `/journal/[id]` | B1 | 있음 |
| 지도하고 이수시킨다 | 진행 현황 | `/progress` | B2·B3 | 있음 |
| 지도하고 이수시킨다 | 이수 판정 | `/completion` | B4 | 있음 |
| 지도하고 이수시킨다 | 출력물 | `/reports` | B5 | 있음 |
| 관리(담당자만) | 학기·기준값 설정 | `/admin/settings` | A1 | 있음 |
| 관리(담당자만) | 교사 승인 | `/admin/teachers` | A2 | 생략(이 문서 기준) |
| 공통 | 로그인, 승인 대기 | `/login`, `/pending` | 0 | — |
| 공통 | 개인정보처리방침, 이용약관 | `/privacy`, `/terms` | 0 | 있음(요약) |

**공통 레이아웃(파트 0, 목업과 같게)**
- 넓은 화면은 **왼쪽 메뉴**, 좁은 화면(860px 이하)은 **위쪽 가로 스크롤 메뉴**를 쓴다.
- 메뉴 그룹은 한눈에 / 대상자를 찾는다 / 지도하고 이수시킨다 / 관리 순서다. 운영 일지에는 ★를 붙인다.
- 위쪽에는 그룹 이름(작게), 화면 제목, 오른쪽에 **명렬표 불러오기** 버튼이 있다. 불러오면 "명렬표 불러옴(이 컴퓨터에만)"으로 바뀐다.
- 아래쪽(푸터)에는 개인정보처리방침, 이용약관, 문의 이메일이 있다.
- 상태 색: 위험(빨강), 주의(주황), 정상·이수 가능(초록), 정보(파랑). 색과 함께 반드시 글자를 쓴다(🔴 위험).
- 알림은 화면 아래 가운데 토스트(2.6초)로 띄운다. 예: "일지를 저장했어요. 시수와 경고가 다시 계산됐어요."

## 4. 업무 규칙 (두 파트 공통 지식)

> 숫자는 모두 `settings` 테이블의 **설정값**이다. 아래 값은 기본값(학교 2025 계획)이다. **코드에 숫자를 직접 쓰지 않는다.**

### 4.1 대상 과목
| 구분 | 성취율 기준(40%) | 출석률 기준(2/3) | 비고 |
|---|---|---|---|
| 1·2학년 공통과목 | 적용 | 적용 | 미달 → 보장지도, 이수 시 성취도 **E**(과학탐구실험 **C**) |
| 선택과목 | 미적용(2026~) | 적용 | 출석률 미달 → 추가 학습 |
| 전문교과 | 과목 설정에 따름 | 적용 | 기준 시수 1학점당 **2시수** |
| 교양 | 미적용 | 적용 | 출석률 미달 → 추가 학습 |
| 창의적 체험활동 | 미적용 | 적용 | 미달 → 창체 추가 학습(선택 기능) |

과목마다 `applies_achievement_rule`(성취율 기준 적용 여부)을 켜고 끈다. 기본값은 공통과목만 `true`다.

### 4.2 점수 계산 (충남 지침 제16조, FAQ 파-01)
- **환산점수** = Σ(받은 점수 ÷ 영역 만점 × 반영비율). 반영비율 합계는 100이다.
- **합계** = 환산점수 합을 소수 셋째 자리에서 반올림해 둘째 자리까지.
- **원점수** = 합계를 소수 첫째 자리에서 반올림한 정수.
- **대상 판정은 원점수(정수)로 한다.** 원점수 < 40이면 미달이다. 예: 39.60 → 40(대상 아님), 39.49 → 39(대상).
- **예상 원점수**(학기 중 위험군용) = 지금까지 들어온 항목의 환산점수 합 ÷ 그 항목들의 반영비율 합 × 100을 같은 방식으로 반올림한 값. 진단평가(`counts_toward_final=false`)는 넣지 않는다.

### 4.3 위험군 판정
| 단계 | 조건(기본값) |
|---|---|
| 🔴 위험 `danger` | 예상 원점수 < `risk_danger_below`(40) **또는** 결과(결석) 횟수 > 수업 횟수 × `absence_warning_ratio`(1/4) |
| 🟡 주의 `caution` | 예상 원점수 < `risk_caution_below`(50) |
| 🟢 정상 `normal` | 그 외 |
- 수업 횟수 = 학점 × `sessions_per_credit`(16).
- 출석률 미달 확정 = 출석 횟수 < 수업 횟수 × 2/3.
- 성취율 기준을 적용하지 않는 과목은 출석 조건만 보고, 사유에 "성취율 기준 미적용 과목"이라고 쓴다.

### 4.4 보장지도 종류와 시기
| 종류 `target_kind` | 대상 | 시기(기본) |
|---|---|---|
| `prevention` 예방지도 | 미도달 **예상** 학생, 희망자 | 학기 초(4월·9월) ~ 2회 지필 전 |
| `remedial` 보충지도 | 미도달 **확정** 학생 | 2회 지필 후 ~ 학기 종료(방학 포함) |
| `attendance` 추가 학습 | 출석률 미달 학생(성취율 충족) | 보충지도와 같음 |
| `creative_attendance` 창체 추가 학습 | 창체 출석률 미달 | 학기 종료 전 |

### 4.5 시수 규칙 (학교 계획 6·7·9) — 파트 B 핵심
| 규칙 | 기본값 | 설정 키 |
|---|---|---|
| 기준 시수(일반) | 1학점당 3시수 이상 | `hours_per_credit_general` |
| 기준 시수(전문교과) | 1학점당 2시수 | `hours_per_credit_vocational` |
| 과목별 직접 지정 | 학교 계획 표 값(예: 공통국어2 15) | `subjects.required_hours_override` |
| 이수 인정 참여율 | 총 운영 시수의 2/3 이상 | `pass_ratio_num`/`pass_ratio_den` |
| 대면지도 필수 | 1시수 이상(실시간 쌍방향 온라인 포함) | `face_to_face_min_hours` |
| 예방지도 → 보충 인정 한도 | 필요 시수의 50% | `prevention_cap_ratio` |
| 정서적 지원 인정 한도 | 필요 시수의 50% | `emotional_cap_ratio` |
| 정서 지원 다과목 중복 인정 | 예(학교 공통 캠프가 모든 과목에 인정) | `emotional_shared_across_subjects` |
| 도달 판정 필수 | 예(보충지도만) | `require_reach_judgment` |
| 1차시 = 1시수 | 0.5 단위 허용 | — |
- 필요 시수 = `required_hours_override` ?? (학점 × 해당 기준 시수)
- 인정 시수 = 보충·추가 학습 직접 시수 + min(예방 시수, 필요 × 예방 한도) + min(정서 시수, 필요 × 정서 한도)
- **이수 가능** = (인정 × 3 ≥ 필요 × 2) **그리고** (대면 ≥ 1) **그리고** (보충지도이고 도달 판정 필수면 `reached`)
- 추가 학습(`attendance`)은 같은 시수 규칙을 쓰고 도달 판정은 필요 없다.
- **부동소수점 비교 금지.** 시수는 0.5 단위이므로 **2배 한 정수**로 계산한다. 한도는 내림한다.

### 4.6 특별 대상 학생 (학교 계획 8)
> **민감정보 최소화:** 장애·이주배경 같은 **사유는 저장하지 않는다.** "어떻게 처리하는지"만 저장한다.

| `special_handling` | 처리 | 학교 계획의 해당 학생(저장 안 함) |
|---|---|---|
| `none` | 일반 규칙 | — |
| `exempt` | 성취율 미적용, 보장지도 대상 제외(출석률 2/3만) | 특수교육대상(건강장애 원격수업 등) |
| `exempt_no_extra` | 보장지도 제외, 추가 학습 미제공 | 위탁 등 학교 밖 수강 |
| `substitutable` | `alt_program_done=true`면 전 과목 100% 대체 | 학생선수(e-School), 이주배경(한국어반 3회), 학습지원대상(기초학력 프로그램) |

### 4.7 결과 처리 (학교 계획 10, 충남 FAQ 파-02)
| 결과 | 성취도 | 생기부 비고란 |
|---|---|---|
| 성취율 미달 → 보장지도 이수 | E(3단계 과목 C) | 적지 않음 |
| 출석률 미달 → 추가 학습 이수 | 원래 성취도 | 적지 않음 |
| 이수 못함 | — | `미이수` |
- 이수 인정은 **학관위 심의 → 학교장 확정**이다. 앱에서는 담당자가 심의일을 넣고 "확정"을 누른다.
- 확정 후 나이스 **「최소 성취수준 보장지도(추가학습) 이수관리」**에서 이수 처리·학점 반영·마감을 해야 생기부에 성적이 보인다. 앱은 입력용 명단을 출력한다.
- 방과후·방학 지도는 학교운영위원회 심의가 필요하다. 학기 설정에 체크 항목으로 둔다.

### 4.8 증빙 보관 (학교 계획 11)
- 중요 증빙(성취도 산출, 이수/미이수 확인)은 졸업 후 1년, 기타 증빙(출석부, 학습지, 과제물, 온라인 수강 이력)은 졸업까지 보관한다.
- 앱은 학년도 말 **PDF·엑셀 백업 내보내기**를 제공한다.

## 5. 기술 스택과 공통 규칙

| 영역 | 선택 |
|---|---|
| 프레임워크 | **Next.js 15 (App Router) + TypeScript** |
| 스타일 | `src/app/globals.css`의 공통 클래스(목업 CSS를 그대로 옮김). Tailwind는 쓰지 않는다(파트 0 결정) |
| DB·로그인 | **Supabase**(Postgres, Auth, RLS), 리전 **Seoul** |
| 배포 | **Vercel**(A 선생님 계정, `main` → 운영 주소), 함수 리전 `icn1` |
| AI | Anthropic Claude API(서버에서만, `@anthropic-ai/sdk`). 모델은 환경변수 `ANTHROPIC_MODEL`, 기본 `claude-opus-5-5`, 거절 시 자동 대체(`fallbacks: "default"`) |
| 엑셀 | ExcelJS |
| AI 결과 표시 | react-markdown(HTML 허용 안 함) |
| 입력 검사 | zod |
| PDF | A4 인쇄용 화면 + 브라우저 "PDF로 저장" |
| 테스트 | Vitest |
| 보안 점검 | dorms-check |

**파트 0이 처음에 모두 설치한 패키지**(나중에 추가하지 않도록):
`next@15`, `react@19`, `react-dom@19`, `@supabase/supabase-js`, `@supabase/ssr`, `exceljs`, `zod`, `react-markdown`, `@anthropic-ai/sdk`, `server-only` / 개발용: `typescript@5`, `@types/*`, `vitest`, `pg`(DB 만들기 스크립트)

**공통 규칙**
1. 화면 문구는 **한국어**로 쓴다. 버튼은 동작을 말한다("일지 저장", "대상자 확정").
2. **휴대폰 폭(390px)** 에서도 모든 화면이 써져야 한다. 운영 일지는 휴대폰 우선.
3. 기준 숫자는 `settings`에서 읽는다.
4. **학생 이름을 서버로 보내거나 저장하지 않는다.** 이름은 `<StudentName studentNo="10305" />`로만 표시한다.
5. 새 npm 패키지는 상대에게 먼저 알린다.
6. 날짜·시간은 한국 시간 기준.
7. **dorms-check 기준(13장)** 을 처음부터 지킨다.

## 6. 협업 구조 — 각자 컴퓨터에서 끝까지 만들고 마지막에 한 번 합치기

### 6.1 세 덩어리
```
파트 0(A가 먼저) → main  →  part-a(A 컴퓨터) / part-b(B 컴퓨터) 동시에 끝까지  →  A 합침 → B가 main 받아 합침 → B 합침
```
- **파트 0**: 뼈대, **전체 DB 스키마(두 파트 테이블 모두)**, 로그인, 메뉴 틀, 공통 부품, 가짜 데이터, 보안 설정. A가 먼저 만들어 `main`에 올린다.
- **파트 A, 대상자를 찾는다**: A1~A9
- **파트 B, 지도하고 이수시킨다**: B1~B5
- 두 파트를 잇는 다리는 **`guidance_targets`(보장지도 대상자) 테이블** 하나다. A가 만들고 확정하면, B가 읽어서 지도한다.
- **마지막에 한 번 합치기 때문에, 충돌이 나지 않도록 파일 주인을 완전히 나눈다(6.2).** 서로의 파일을 건드리지 않으면 합칠 때 충돌은 거의 `package-lock.json` 정도만 생긴다.

### 6.2 파일 소유권 (절대 규칙)
| 경로 | 주인 | 다른 파트 |
|---|---|---|
| `supabase/migrations/0001_init.sql`, `supabase/seed.sql` | 0 | 수정 금지 |
| `src/lib/types.ts`, `src/lib/supabase/*`, `src/lib/excel.ts`, `src/lib/settings.ts`, `src/lib/auth/requireTeacher.ts`, `src/lib/roster.ts` | 0 | import만 |
| `src/components/ui/*`, `src/components/StudentName.tsx`, `src/components/PrintLayout.tsx`, `src/components/HoursBar.tsx`, `src/components/RiskBadge.tsx` | 0 | import만 |
| `src/app/layout.tsx`, `src/app/(shared)/*`(login, pending, privacy, terms), `middleware.ts`, `next.config.*`, `public/robots.txt` | 0 | 수정 금지 |
| `docs/mockup/*`, `PRD.md`, `CLAUDE.md`, `.env.example`, `package.json`(초기) | 0 | 수정 금지(6.4) |
| `src/config/nav-a.ts` | **A** | 수정 금지 |
| `src/app/(a)/**`, `src/components/a/**`, `src/lib/a/**`, `src/app/api/a/**` | **A** | 수정 금지(`src/lib/a`는 import 가능) |
| `src/lib/rules/scoring.ts` + `scoring.test.ts` | **A** | import만 |
| `src/config/nav-b.ts` | **B** | 수정 금지 |
| `src/app/(b)/**`, `src/components/b/**`, `src/lib/b/**`, `src/app/api/b/**` | **B** | 수정 금지(`src/lib/b`는 import 가능) |
| `src/lib/rules/hours.ts` + `hours.test.ts` | **B** | import만 |
| 새 마이그레이션 `supabase/migrations/<타임스탬프>_a_*.sql` / `_b_*.sql` | 각 파트 | 자기 테이블에 **컬럼 추가만** |

> Next.js 라우트 그룹 `(a)`, `(b)`는 주소에 나타나지 않는다. `src/app/(a)/risk/page.tsx` → `/risk`

### 6.3 각자 컴퓨터에서 개발하기
- 각자 저장소를 받아(`git clone`) 자기 브랜치(`part-a` / `part-b`)에서만 작업한다.
- 화면 확인은 각자 `npm run dev` → `http://localhost:3000`
- **매일 자기 브랜치를 GitHub에 push(백업)** 한다. `main`에는 합치기 전까지 올리지 않는다.
- 개발용 DB는 **Supabase 프로젝트 하나를 같이 쓴다**(A 소유). 파트 0이 두 파트 테이블을 모두 만들어 두므로 서로 기다릴 필요가 없다.
- 상대 파트 기능이 없어도 `seed.sql`의 가짜 데이터로 만든다. 예: B는 확정 대상자 6명으로 일지를 만든다. A의 대시보드는 B의 `computeProgress`가 비어 있으면 "B 연결 대기"를 보여 준다.

### 6.4 공통 파일을 바꿔야 할 때 (되도록 피함)
1. 상대에게 먼저 말하고, GitHub **Issue**에 `[공통 변경 요청]`으로 무엇을 왜 바꿀지 적는다.
2. **A가** `common/<내용>` 브랜치에서 그것만 바꿔 PR → `main`에 합친다.
3. 두 사람 모두 자기 브랜치에 `main`을 받아 온다(`git pull origin main`).

### 6.5 접속 정보(키) 나누기
| 값 | 누가 가짐 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | A, B | 브라우저 공개 값. 메신저 전달 가능 |
| `DATABASE_URL` | A만 | Supabase "Session pooler" 주소(DB 비밀번호 포함). `npm run db:setup`에만 사용. 전달 금지 |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | A만 | A8에서만 사용 |
| 운영(Vercel) 환경변수 | A의 Vercel | Vercel 웹에서 등록 |
- `.env.local`은 커밋하지 않는다(`.gitignore`). `.env.example`에는 이름만 적는다.

### 6.6 마지막 합치기 (기술 요약, 사람용 단계는 G5)
1. A: 완료 기준 확인 → `npm run build && npm test` → push → PR(`part-a` → `main`) → Merge
2. B: 커밋 → `git pull origin main` → 충돌은 6.2 기준(B 파일은 B, 나머지는 main) → `package-lock.json` 충돌은 `npm install`로 다시 생성 → build/test → 통합 시험 1~4 → push → PR(`part-b` → `main`) → Merge
3. 함께: `main`에서 G6 통합 시험 전체 → Vercel 배포 확인 → dorms-check

## 7. 데이터 모델 (파트 0이 전부 만든다)

### 7.1 열거값
| 이름 | 값 |
|---|---|
| `role` | `admin`, `teacher` |
| `subject_category` | `common`(공통), `elective`(선택), `vocational`(전문교과), `liberal`(교양), `creative`(창체) |
| `grading_scale` | `five`(A~E), `three`(A~C) |
| `assessment_kind` | `diagnostic`(진단), `performance`(수행), `exam`(지필) |
| `absence_type` | `인정결`, `질병결`, `미인정결`, `기타결` |
| `special_handling` | `none`, `exempt`, `exempt_no_extra`, `substitutable` |
| `risk_level` | `danger`, `caution`, `normal` |
| `cause_tag` | `basic_skills`(기초학력), `motivation`(동기·태도), `attendance_life`(출결·생활), `emotional`(정서·심리), `language`(언어), `practical_skill`(실습 기능) |
| `target_kind` | `prevention`, `remedial`, `attendance`, `creative_attendance` |
| `target_status` | `candidate`(후보), `checked`(교과 확인), `excluded`(제외), `confirmed`(확정·지도 중) |
| `session_kind` | `prevention`, `remedial`, `attendance`, `creative_attendance`, `emotional_common`(학교 공통 정서 지원) |
| `session_method` | `face_to_face`(대면), `after_school`(방과후), `online_content`(EBSi 등 온라인), `assignment`(보충과제), `mentoring`(학습멘토링), `in_class`(수업시간 별도 지도), `emotional`(정서 지원), `external_program`(타 프로그램) |
| `attendance_status` | `present`(출석), `late`(지각), `absent`(결석) |
| `reach_judgment` | `reached`(도달), `not_reached`(미도달) |
| `completion_result` | `pending`, `passed`(이수), `failed`(미이수) |

### 7.2 테이블
> 모든 테이블에 `id uuid pk default gen_random_uuid()`(복합키 제외), `created_at timestamptz default now()`가 있다. **학생 이름 컬럼은 어디에도 없다.**

**teachers** *(쓰기 A / 읽기 모두)*: id(=auth.users.id), email, display_name, role(기본 teacher), approved(기본 false)

**terms** *(쓰기 A)*: school_year, semester(1·2), starts_on, ends_on, prevention_start, prevention_end, remedial_start, remedial_end, school_council_approved(bool), is_current(bool, 하나만 true)

**settings** *(쓰기 A / 읽기 모두, 학기당 1행)*
| 컬럼 | 기본값 |
|---|---|
| term_id (pk, fk) | |
| hours_per_credit_general | 3 |
| hours_per_credit_vocational | 2 |
| sessions_per_credit | 16 |
| pass_ratio_num / pass_ratio_den | 2 / 3 |
| face_to_face_min_hours | 1 |
| prevention_cap_ratio | 0.5 |
| emotional_cap_ratio | 0.5 |
| emotional_shared_across_subjects | true |
| require_reach_judgment | true |
| risk_danger_below | 40 |
| risk_caution_below | 50 |
| absence_warning_ratio | 0.25 |
| ai_monthly_limit_krw | 10000 |
| ai_price_input_per_mtok_krw / ai_price_output_per_mtok_krw | null(담당자 입력) |

**subjects** *(쓰기 A)*: term_id, name, grade, department(null), credits, category, grading_scale, applies_achievement_rule, required_hours_override(null), teacher_id(지도 교사)

**achievement_standards** *(쓰기 A)*: subject_id, code, description, sort_order

**assessment_items** *(쓰기 A)*: subject_id, name, kind, max_score, weight_percent(진단 0), counts_toward_final(진단 false), sort_order

**students** *(쓰기 A)*: school_year, student_no(학번 5자리 `GCCNN`, 예 `10305`), grade, class_no, number, department(null), special_handling(기본 none), alt_program_done(bool). unique(school_year, student_no)

**enrollments** *(쓰기 A)*: pk(student_id, subject_id)

**scores** *(쓰기 A)*: student_id, assessment_item_id, score(null), absence_type(null), updated_by, updated_at. unique(student_id, assessment_item_id)

**subject_attendance** *(쓰기 A)*: pk(student_id, subject_id), absences(결과 횟수), as_of

**diagnoses** *(쓰기 A)*: pk(student_id, subject_id), weak_standard_codes text[], causes cause_tag[], memo, updated_by

**guidance_targets** ★ *(쓰기 A: 선정·확정 / 읽기 B / `consent_received`만 A·B 모두)*: term_id, student_id, subject_id(창체는 null), kind, status(기본 candidate), reason(예 `원점수 36`, `결과 21회 > 20회`), projected_score, excluded_reason, consent_received, checked_by/at, confirmed_by/at. unique(term_id, student_id, subject_id, kind)

**sessions** ★ 운영 일지 *(쓰기 B)*: term_id, subject_id(정서 공통은 null), kind, method, held_on, period_label(예 `7교시`, `방과후`, `방학`), hours(기본 1, 0.5 단위), content, teacher_id, updated_at

**session_attendance** *(쓰기 B)*: pk(session_id, student_id), status, credited_hours(출석·지각 = session.hours, 결석 = 0)

**phrase_snippets** *(쓰기 B)*: teacher_id, text, sort_order

**completion_results** ★ *(쓰기 B)*: target_id(unique), reach_judgment(null), reach_method(null), retest_score(null), result(기본 pending), committee_date(null), decided_by/at, neis_done(bool)

**worksheets** *(쓰기 A)*: subject_id, title, standard_codes text[], level(`basic`/`standard`), causes cause_tag[], content_md, source(`ai`/`manual`), created_by, is_shared

**ai_usage** *(쓰기 A)*: teacher_id, input_tokens, output_tokens, est_cost_krw

### 7.3 보안(RLS), 파트 0이 설정
- 모든 테이블 RLS를 켠다. SQL 함수 `is_approved()`, `is_admin()`을 둔다.
- **로그인하지 않은 사용자(anon)는 모든 테이블에서 0행**(dorms-check 차단 항목). 공개 읽기 테이블은 없다.
- 읽기: `is_approved()`. 쓰기: `is_approved()`. 단, `settings`·`terms`·`teachers.role/approved` 변경, `guidance_targets.status='confirmed'` 전환, `completion_results.result` 확정은 `is_admin()`만 한다.
- `sessions`, `session_attendance`의 수정·삭제는 작성 교사 본인 또는 admin만 한다.

## 8. 파트 간 약속 (계약)

### 8.1 공유 타입: `src/lib/types.ts`(파트 0)
7장의 테이블·열거값을 TypeScript 타입으로 둔다. 두 파트는 이 타입만 쓴다.

### 8.2 규칙 함수: 주인만 구현, 상대는 import
파트 0이 **시그니처와 빈 구현**을 만든다. 빈 구현은 `null`이나 빈 결과를 돌려준다. 상대 파트 화면은 결과가 비어 있어도 깨지지 않아야 한다("연결 대기" 표시).
```ts
// src/lib/rules/scoring.ts — 주인: A
export function round2(x: number): number;
export function toRawScore(total: number): number;
export function computeScore(items: AssessmentItem[], scores: Score[]): {
  total: number; rawScore: number | null; projectedRaw: number | null; coveredWeight: number;
};
export function riskLevel(args: {
  projectedRaw: number | null; absences: number; credits: number; appliesAchievement: boolean; settings: Settings;
}): { level: RiskLevel; reasons: string[] };

// src/lib/rules/hours.ts — 주인: B
export function requiredHours(subject: Subject, settings: Settings): number;
export function computeProgress(args: {
  target: GuidanceTarget; subject: Subject | null; student: Student;
  sessions: Session[]; attendance: SessionAttendance[];
  emotionalCommon: { session: Session; att: SessionAttendance }[];
  settings: Settings; completion: CompletionResult | null;
}): {
  required: number; needToPass: number; direct: number; faceToFace: number;
  prevention: number; preventionCredited: number; emotional: number; emotionalCredited: number;
  credited: number; remainingToPass: number;
  ratioOk: boolean; faceToFaceOk: boolean; reachOk: boolean; reachNeeded: boolean;
  substituted: boolean; completable: boolean;
  warnings: { text: string; soft?: boolean }[];   // 화면에 그대로 보여 줄 한국어
} | null;
```

### 8.3 상태 흐름
```
guidance_targets.status : candidate ─(교과 교사 "교과 확인")→ checked ─(담당자 "확정")→ confirmed
                              └─(제외 사유 선택)→ excluded
completion_results.result: pending ─(담당자, 학관위 심의일)→ passed | failed
```
- A는 `candidate/checked/excluded/confirmed`까지만 바꾼다. **후보에서 바로 확정은 불가**하다.
- B는 `confirmed` 대상자만 쓰고 `guidance_targets`는 읽기만 한다(`consent_received` 예외).

### 8.4 메뉴
`layout.tsx`(파트 0)가 `nav-a.ts`와 `nav-b.ts`를 합쳐 그린다. 각 파트는 자기 파일에만 메뉴를 넣는다.
```ts
export type NavItem = { href: string; label: string; group: '한눈에' | '대상자를 찾는다' | '지도하고 이수시킨다' | '관리'; adminOnly?: boolean; star?: boolean };
```

### 8.5 공통 컴포넌트(파트 0, 목업 모양 그대로)
`Button`(기본·강조·작은), `Card`, `Table`(가로 스크롤 감쌈), `Badge`(위험·주의·정상·정보·중립), `Chip`(선택형), `Tabs`, `Input`, `Select`, `Toast`, `PageHeader`, `EmptyState`, `KpiTile`, `StudentName`, `PrintLayout`(A4), `RiskBadge`, `HoursBar`(직접=주황, 예방=파랑, 정서=초록, 2/3 기준선=빨간 점선).

## 9. 파트 0 — 공통 기반 (A가 먼저, 약 1주)

### 할 일
1. GitHub 비공개 저장소 `bojang-manager`. `main` 보호(PR로만 합치기) 설정
2. Next.js + TypeScript + Tailwind + ESLint + Vitest, 5장 패키지 전부 설치
3. Supabase 프로젝트(리전 Seoul): `0001_init.sql`(7장 전체 + RLS + 함수) 실행
   - 로그인: Google, 개발 중엔 이메일 매직링크도 허용
   - 허용 주소: `http://localhost:3000/**`, Vercel 주소
4. `src/lib/supabase/{client,server}.ts`, `middleware.ts`(미로그인 → `/login`, 미승인 → `/pending`), `requireTeacher()`
5. `types.ts`, `settings.ts`, `excel.ts`, `roster.ts`(13.1), 규칙 함수 시그니처와 빈 구현, 빈 테스트 파일
6. `layout.tsx`와 메뉴(3장 공통 레이아웃): `nav-a.ts`·`nav-b.ts`에 각 화면 링크, `(a)`·`(b)` 각 주소에 "준비 중" 페이지
7. 공통 컴포넌트(8.5): **목업의 색·글꼴·간격 토큰을 그대로** 옮긴다.
8. `seed.sql`: 목업의 예시 데이터를 그대로 넣는다.
   - 2026학년도 1학기, 기본 설정
   - 과목 6개: 공통국어2·공통수학2·공통영어2·한국사2 각 5학점(필요 시수 15) / 반려동물관리 9학점 전문 / 식품위생 3학점 전문(성취율 미적용)
   - 가짜 학생: 학번만, 목업의 16명 + 빈 학생 44명 = 60명
   - 성적 합계: 목업 값(36.40, 39.60, 31.25 … 39.49)이 나오게
   - 대상자 10건(확정 6, 교과 확인 1, 후보 2, 제외 1)
   - 일지 12건(목업과 같은 날짜·시수·출석)
9. `docs/mockup/index.html`에 목업 복사
10. `/privacy`, `/terms`, 푸터, 보안 헤더 등 13.2의 파트 0 항목 전부
11. Vercel 연결(A 계정, 환경변수, 리전 `icn1`), `.env.example`, `README.md`(실행 방법), `CLAUDE.md`(부록 B)
12. 첫 배포 후 `dcheck` 기준 점검, 결과를 `docs/dorms-check/`에 저장

### 완료 기준
- A·B 모두 로그인 → (승인 후) 메뉴에 모든 화면 이름과 "준비 중" 페이지가 보인다.
- 홈 또는 전교 현황 자리에 가짜 데이터 개수가 보인다(예: 학생 60, 확정 대상 6).
- `npm run build`, `npm test`가 통과하고 Vercel 주소가 열린다.
- dorms-check 차단 항목 0건, anon 키로 모든 테이블 조회 시 0행이다.

## 10. 파트 A — 대상자를 찾는다 (A 선생님)

> 순서: **A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9**. 각 기능의 **완료 기준**을 통과하면 커밋한다. 화면은 목업과 같게 만든다.

### A1. 학기·기준값 설정 · `/admin/settings` (담당자만)
- **기간 카드**: 예방지도·보충지도 기간 배지, "학교운영위원회 심의 완료(방과후·방학 지도)" 체크
- **기준값 카드**: 4장 설정값을 카드 격자로 보여 준다. 각 카드에는 이름, 숫자 입력, 단위, **근거 문구**(예: "학교 계획: 1학점당 3시수 이상")를 둔다.
- **토글 2개**: 도달 판정 필수, 정서 지원 다과목 중복 인정
- **보안 점검 카드**: 마지막 dorms-check 결과 요약(차단 항목, 보안 헤더, 방침 공개). 처음엔 `docs/dorms-check/` 기준으로 수동 표시해도 된다.
- 값을 바꾸면 토스트 "기준값을 바꿨어요. 다른 화면에 바로 반영돼요."
- **완료 기준**: 값을 바꾸면 위험군 판정이 바로 달라진다(합친 뒤에는 진행 현황도).

### A2. 교사 승인 · `/admin/teachers` (담당자만, 목업 생략)
- 승인 대기 목록, 승인·거절, 역할 변경(admin/teacher)
- **완료 기준**: 승인 전에는 `/pending`만 보인다.

### A3. 과목·평가 계획 · `/subjects`, `/subjects/[id]` (목업 생략)
- 과목 등록: 이름, 학년, 학과, 학점, 구분, 성취도 단계, 성취율 기준 적용, 필요 시수 직접 지정, 지도 교사
- 평가 항목: 이름, 종류, 만점, 반영비율. **반영비율 합계 100% 검사**(진단 제외). 아니면 "반영비율 합계가 90%입니다. 100%가 되게 맞춰 주세요."
- 성취기준: 직접 입력 또는 엑셀 붙여넣기
- **완료 기준**: 합계가 100이 아니면 저장되지 않는다.

### A4. 학생·수강 편성 · `/students` (목업 생략)
- 학번 엑셀 업로드. **이름 열이 있어도 서버로 보내지 않고 버린다.**
- 수강 편성: 반 단위 일괄 + 개별 수정
- 특별 처리 지정(4.6), 대체 프로그램 이수 체크. **사유 입력 칸은 만들지 않는다.**
- **완료 기준**: 업로드 요청에 이름이 없다(브라우저 네트워크 탭 확인).

### A5. 성적·출결 올리기 · `/scores`
- 위쪽에 4단계 표시: **1 양식 받기 → 2 채워서 올리기 → 3 미리보기 확인 → 4 저장**
- 드롭존: "엑셀 파일을 끌어다 놓거나 파일 선택 · 엑셀에서 복사한 표를 붙여넣기해도 돼요" + "이름 열이 있어도 서버로 보내지 않고 버립니다"
- 미리보기 표: 학번, 평가 항목, 점수, 결시, 확인
  - **오류 행은 빨간 배경**으로 이유를 쓴다: "없는 학번", "만점(100) 초과"
  - 위쪽에 "오류 n행 / 정상 n행" 배지
- 버튼: **"오류 n행 빼고 저장"**, **"양식 엑셀 받기"**. 결과 횟수(출결)도 같은 방식이다.
- 나이스 성적 엑셀 직접 읽기는 샘플 확보 후 추가한다.
- **완료 기준**: 60명 × 3항목 업로드가 10초 안에 끝나고, 오류 행이 보인다.

### A6. 위험군 판별·진단 · `/risk`
- 필터: 과목 선택 + 단계 칩(전체 / 🔴 위험 / 🟡 주의 / 🟢 정상)
- 표: 학생(`StudentName`), 과목, **예상 원점수**(소수가 있으면 옆에 작게 "39.60 → 40"), 결과(결석) 횟수, 단계 배지, 사유, [진단] 버튼
- 정렬: 위험 → 주의 → 정상, 같은 단계에서는 점수 낮은 순
- 표 아래 안내: 반올림 규칙과 "설정에서 바꿀 수 있어요"
- **오른쪽 진단 패널**(좁은 화면은 아래): 학생·과목·단계 요약
  - 약한 성취기준 칩(여러 개 선택), 원인 체크(선택 입력, 6개)
  - 메모와 경고 "학생 건강·가정 사정 같은 민감한 내용은 적지 마세요."
  - [진단 저장], [이 약점으로 활동지 만들기]
- **완료 기준**: 12.1 테스트 통과, 화면 숫자와 테스트 결과가 같다.

### A7. 대상자 선정 · `/targets`
- 위쪽: 종류 선택(보충지도·원점수 40 미만 / 예방지도·위험·주의 / 추가 학습·출석률 2/3 미달) + **[후보 만들기]** + 안내 "후보 → 교과 확인 → 담당자 확정 순서로만 진행돼요."
- 탭: **후보 / 교과 확인 / 확정·지도 중 / 제외**(각 개수 표시)
- 행 동작:
  - 후보: [교과 확인] + "제외 사유 선택…"(성적 정정 예정 / 전출 예정 / 특별 처리 대상)
  - 교과 확인: [확정](담당자만, 교과 교사는 잠김 + "담당자만 확정할 수 있어요")
  - 확정: "동의서 회수" 체크
  - 제외: 사유 표시
- 특별 처리 `substitutable` 학생은 "대체 가능" 배지를 단다.
- 확정 탭 안내: "확정된 대상자만 운영 일지와 이수 판정에 나타나요."
- **완료 기준**: 상태가 8.3을 벗어나지 않는다.

### A8. AI 보충 활동지 · `/worksheets`
- **왼쪽 폼**: 과목, 약한 성취기준(진단에서 자동 채움), 수준(기초/표준), 원인 태그, 문항 수, 안내 "🔒 학번·이름은 보내지 않아요", [AI로 초안 만들기], **이번 달 사용량 막대**("3,200원 / 10,000원", "한도에 닿으면 이 버튼만 잠겨요")
- **오른쪽 미리보기**: 학습 목표, 핵심 개념, 단계별 문항 목록, "정답·해설은 교사용 별지에 따로 출력돼요." + [자료실에 저장], [인쇄]
- 서버 `POST /api/a/worksheets/generate`: `requireTeacher()`, 교사당 1분 5회 제한, 프롬프트는 서버에만, 요청에 5자리 숫자(학번 패턴)가 있으면 거절
- 사용량은 `ai_usage`에 기록한다. 이번 달 합계가 한도 이상이면 버튼을 잠근다. 단가가 비어 있으면 월 50회로 제한한다.
- 결과는 react-markdown(HTML 불가)으로 표시한다.
- **완료 기준**: 로그인 없이 호출하면 401, 한도 초과 시 API 미호출, 요청 본문에 학번·이름이 없다.

### A9. 전교 현황 · `/dashboard`
- **요약 숫자 4개**:
  - 🔴 위험군(보조: 주의 n건)
  - 보장지도 확정 대상(보조: 후보·교과 확인 수)
  - 이수 가능 n / 전체
  - 보충 기간 종료 **D-n**
- **과목별 현황 표**: 과목(구분·학점), 위험, 주의, 확정 대상, 이수 가능, 필요 시수. 아래에 성취율 미적용 과목 안내
- **할 일 카드**(역할별 문장) + 바로가기 버튼(담당자: "대상자 선정으로 가기", 교사: "운영 일지 쓰기")
- 이수 가능 수는 B의 `computeProgress`를 쓴다. 합치기 전에는 "B 연결 대기"를 표시한다.
- **완료 기준**: 휴대폰 첫 화면에 요약 숫자 4개가 보인다.

## 11. 파트 B — 지도하고 이수시킨다 (B 선생님)

> 순서: **B1 → B2 → B3 → B4 → B5**. B1·B2가 최우선이다. 화면은 목업과 같게 만든다.

### B1. 운영 일지 쓰기 ★ · `/journal`, `/journal/new`, `/journal/[id]`
- **휴대폰 우선**이고, 목표는 30초다. PC에서는 왼쪽에 휴대폰 폭 입력 카드, 오른쪽에 **"내 최근 일지"** 표(날짜, 종류, 방법, 시수, 출석 n/m)와 [진행 현황 보기]를 둔다.
- 입력 순서(위에서 아래로):
  1. **과목**: 내 과목 자동. 종류가 학교 공통 정서면 "과목 없음(학교 공통)"
  2. **종류 칩**: 예방지도 / 보충지도 / 추가 학습 / 창체 추가 학습 / 학교 공통 정서 지원
  3. **방법 칩**: 대면 / 방과후 / EBSi 등 온라인 / 보충과제 / 학습멘토링 / 수업시간 별도 지도 / 정서 지원 / 타 프로그램
  4. **날짜**: 기본 오늘, 눌러서 변경
  5. **교시 칩**: 점심 / 7교시 / 8교시 / 방과후 / 방학
  6. **시수**: [−] 숫자 [＋], 0.5 단위, 기본 1
  7. **출석**: 그 과목·종류의 **확정 대상자**가 기본 "출석"이다. 누를 때마다 출석 → 지각 → 결석으로 바뀐다. 예방지도는 그 과목의 위험·주의 학생과 희망자, 학교 공통 정서는 전체 대상자가 나온다.
  8. **지도 내용**: [지난 차시 불러오기], 자주 쓰는 문장 칩("+ 중심 내용 찾기 연습" 등, `phrase_snippets`), 입력칸
  9. 큰 **[일지 저장]** 버튼
- 저장 토스트: "일지를 저장했어요. 시수와 경고가 다시 계산됐어요."
- 내 일지 목록, 수정·삭제(본인)
- **완료 기준**: 휴대폰 폭에서 스크롤 2번 이내로 저장되고, 저장 즉시 B2 계산에 반영된다.

### B2. 시수 계산 엔진 ★ · `src/lib/rules/hours.ts`
- 4.5·4.6 규칙대로 `computeProgress`를 구현한다(2배 정수).
- 경고 문구(그대로 표시, `soft`는 주황):
  - `대면지도 시수가 없습니다(1시수 이상 필요).`
  - `이수 기준까지 n시수 남았습니다.`
  - `예방지도는 한도 n시수까지만 인정됩니다.` (soft)
  - `정서 지원은 한도 n시수까지만 인정됩니다.` (soft)
  - `도달 판정을 입력해 주세요.`
  - `도달 판정이 미도달입니다.`
- **완료 기준**: 12.2 테스트 전부 통과

### B3. 진행 현황 · `/progress`
- 위쪽 범례: 보충 직접(주황) · 예방(한도 50%, 파랑) · 정서 지원(한도 50%, 여러 과목 중복, 초록) · 이수 기준 2/3(빨간 점선) + **[경고 있는 학생만]** 토글
- 표:
  - 학생
  - 과목·종류
  - **시수 막대(HoursBar)** + "보충 n · 예방 n(9 중) · 정서 n"
  - 인정 / 기준 + 필요
  - 대면(배지 "n시수" / "없음" / 대체)
  - 상태 배지(이수 가능 / 아직 불가 / 대체 이수 가능) + 경고 목록
- 교과 교사는 자기 과목만 본다. 아래 안내: "기준 숫자는 학기·기준값 설정에서 바꾸면 바로 반영돼요."
- **완료 기준**: 일지를 저장하고 돌아오면 숫자가 바뀌어 있다.

### B4. 이수 판정 · `/completion`
- 위쪽: **학관위 심의일**(담당자만) + **[이수 가능 n명 확정]**(담당자만). 교과 교사에게는 "확정은 담당자만 할 수 있어요. 교과 교사는 도달 판정을 입력해요."
- 표:
  - 학생, 과목·종류, 인정 / 기준, 대면 ✓/✗
  - **도달 판정**: 보충지도는 미입력/도달/미도달 선택, 추가 학습은 "해당 없음", 대체는 "대체 이수"
  - 상태
  - **생기부 처리**: "성취도 E · 비고 적지 않음" / "원래 성취도 · 비고 적지 않음" / "비고: 미이수"
- 아래 안내: 나이스 「최소 성취수준 보장지도(추가학습) 이수관리」에서 처리해야 한다는 문장
- 이수 불가 학생은 확정되지 않는다. 강제 확정은 사유가 필수이고, 나중에 추가한다.
- **완료 기준**: completable=false인 학생은 passed가 되지 않는다.

### B5. 출력물 · `/reports`
- **카드 6개**: 차시별 참여 출석부 / 나이스 입력 명단 / 학관위 대상자 명단 / 학관위 이수 인정 명단 / 참여 동의서 / 결과 보고서·통계
- 버튼: [PDF로 저장(인쇄)], [엑셀로 내보내기]. 안내: "이름은 이 컴퓨터의 명렬표에서 채워져 인쇄돼요. 서버에는 학번만 있어요."
- **출석부 A4**(학교 양식):
  - 제목 "2026학년도 ○학년 ○학기 ○○ 보충지도 참여 출석부"
  - 확인 교사 서명란, "필요 시수·이수 기준·대면 1시수" 안내
  - 표: 번호, 학번, 이름, 차시별 열(날짜·방법), 합계. 참여는 1, 불참은 빈칸
  - 빈 줄을 채워 한 장에 28줄이 되게 하고, 넘치면 다음 장으로 넘긴다.
  - 아래에 인정 한도 안내
- **나이스 입력 명단**: 학번, 이름, 과목, 구분(보장지도/추가학습), 결과(이수/미이수/확정 전), 성취도, 비고란
- 학관위 자료 2종, 참여 동의서(영역 O 표시, 기간·시수 안내, 학생·보호자 서명란), 결과 보고서(과목별 이수율, 방법별 시수), 학년도 말 백업
- **완료 기준**: 출석부를 인쇄 미리보기로 열면 A4 한 장에 28줄이 들어간다.

## 12. 규칙 테스트 케이스 (반드시 자동 테스트)

### 12.1 점수(`scoring.test.ts`, A)
| # | 입력 | 기대값 |
|---|---|---|
| S1 | 1회 지필 100·30%, 2회 지필 100·30%, 수행 100·40%. 점수 30·40·45 | 환산 39.00, rawScore 39 → 미달 |
| S2 | 환산 합 39.6 | 40 → 미달 아님 |
| S3 | 39.49 | 39 |
| S4 | 39.5 | 40 |
| S5 | 수행 200점 만점에 100점, 반영 40% | 환산 20 |
| S6 | 1회 지필만(30%), 35점 | coveredWeight 30, projectedRaw 35 → danger |
| S7 | projectedRaw 45, 결과 0 | caution |
| S8 | projectedRaw 70, 5학점(80회), 결과 21 | danger(21 > 20) |
| S9 | 성취율 미적용 과목, projectedRaw 10, 결과 0 | normal |

### 12.2 시수(`hours.test.ts`, B). 기본 설정, 공통국어2 필요 15
| # | 상황 | 기대값 |
|---|---|---|
| H1 | 필요 시수 | 15, 기준 10 |
| H2 | 보충 대면 2 + 과제 3 + 예방 9 + 정서 6, 도달 | 예방 인정 7.5, 정서 6, 인정 18.5 → completable |
| H3 | 예방 7.5 + 정서 6, 보충 없음 | 13.5 ≥ 10이지만 대면 0 → 불가, "대면지도 시수가 없습니다" |
| H4 | 대면 1 + 과제 8, 도달 | 9 < 10 → 불가, 남은 1 |
| H5 | 대면 1 + 과제 9, 미도달 | 불가(reachOk false) |
| H6 | H5 + `require_reach_judgment=false` | completable |
| H7 | 반려동물관리 9학점 전문, override 없음 | 필요 18, 기준 12 |
| H8 | `substitutable` + alt_program_done | substituted, completable |
| H9 | 정서 6이 두 과목에 | 두 과목 모두 정서 인정 6 |
| H10 | `emotional_shared_across_subjects=false` | 학교 공통 정서는 인정 안 함 |
| H11 | 결석한 일지 | 0시수 |
| H12 | 0.5시수 일지 3회 출석 | 직접 1.5 |
| H13 | 추가 학습: 대면 2 + 과제 4 + 정서 6 | 12 ≥ 10, 도달 판정 불필요 → completable |

## 13. 개인정보·보안 — dorms-check 기준

> 점검 통과는 "확인한 범위에서 위험이 발견되지 않음"이에요. 학교 승인을 보장하지 않아요. 최종 선정은 학운위 심의와 학교장이 결정해요.

### 13.1 설계 원칙
1. 학생 이름은 서버에 저장하지 않는다. DB에는 학번만 둔다.
2. **명렬표 로컬 저장**: `roster.ts`가 브라우저 `localStorage` 키 `roster:<school_year>`에 `{ "10305": "이름" }`을 저장한다. `<StudentName>`은 이름이 있으면 "10305 이름", 없으면 학번만 보여 준다. "이 컴퓨터에서 명렬표 지우기" 버튼을 둔다.
3. 인쇄물의 이름은 교사 화면에서 합쳐지는 것이므로 허용한다.
4. AI 호출에는 학생 식별 정보를 넣지 않는다(서버에서 학번 패턴을 검사한다).
5. 비밀 키는 서버 환경변수에만 둔다. `.env.local`은 커밋하지 않는다.
6. 개발·시험은 가짜 데이터로만 한다. 실제 학생 정보는 점검·승인 후 별도 운영 DB에서 쓴다.
7. 교사 승인제, RLS
8. 에듀집 유형 C(식별정보 가림 후 외부 전송): 이용자는 교사로 한정하고, 학생 이름은 교사 기기에만, 서버엔 학번만, AI엔 익명 정보만 보낸다.
9. 민감정보(장애·이주배경 등)는 저장하지 않는다. 메모 칸에 경고 문구를 둔다.

### 13.2 보안 점검 항목과 구현
| dorms-check 항목 | 구분 | 구현 | 담당 |
|---|---|---|---|
| `sec.transport.ssl-valid` | **차단** | Vercel 기본 HTTPS | 0 |
| `info.secret-exposed` | **차단** | `.env*` 커밋 금지, 키는 Vercel 환경변수에만 | 모두 |
| `code.rls.anon-read` | **차단** | 모든 테이블 RLS, anon 0행 테스트(`npm run test:rls`) | 0 |
| `code.client-secret-leak` | 위험 | 서비스 키·AI 키에 `NEXT_PUBLIC_` 금지, `server-only` | 모두 |
| `code.hardcoded-secret` | 위험 | 코드에 키 금지 | 모두 |
| `sec.header.*`(CSP·HSTS·X-Frame·nosniff·Referrer·Permissions) | 권고 | `middleware.ts`에서 nonce CSP와 헤더 6종 | 0 |
| `sec.fingerprint.powered-by`, `info.source-map` | 권고 | `poweredByHeader:false`, `productionBrowserSourceMaps:false` | 0 |
| `sec.transport.cookie-flags` | 권고 | 로그인 쿠키 `Secure`, `SameSite=Lax` | 0 |
| `info.stack-trace` | 권고 | `error.tsx`, `not-found.tsx` 일반 오류 화면 | 0 |
| `cors.policy` | 권고 | API에 CORS 헤더를 열지 않음 | A·B |
| `code.endpoint.unauth` | 권고 | 모든 `src/app/api/**` 첫 줄 `requireTeacher()` | A·B |
| `code.dangerous-pattern` | 검토 | `eval`, `new Function`, `dangerouslySetInnerHTML`, `innerHTML` 금지 | 모두 |
| `legal.privacy-policy`, `legal.terms`, `legal.contact` | 권고 | `/privacy`, `/terms`, 푸터 문의 이메일 | 0 |
| `seo.*` | 참고 | title·description·viewport·OG, 로그인 뒤 화면 `noindex` | 0 |
| `protection.boundary.api-abuse`, `.prompt` | 보호 | AI 호출 제한, 프롬프트 서버 보관 | A |
| `protection.release.debug` | 보호 | `console.log`로 키·학생 정보 출력 금지 | 모두 |

### 13.3 개인정보처리방침 `/privacy` (에듀집 9개 항목)
dorms-check `templates/privacy-policy.ko.md`를 골격으로 쓴다.
| 에듀집 | 조항 | 내용 |
|---|---|---|
| 1-1 | 제2조 수집 항목 | 교사: 이메일, 표시 이름. 학생: 학번(가명), 성적, 결과 횟수, 보장지도 기록, 특별 처리 구분. 이름·연락처·민감정보는 수집하지 않음 |
| 1-2 | 제3조 목적 | 대상 선정, 지도 기록, 이수 판정, 학교 보고 |
| 1-3 | 제4조 보유·파기 | 학년도 종료 후 백업 내보내기 → 정한 기간 안에 삭제(17장 7번) |
| 5-2 | 제5조 제3자 제공 | 제공하지 않음 |
| 5-3 | 제6조 위탁 | Supabase(서울), Vercel(서울 함수), Anthropic(활동지, 개인정보 전송 없음) |
| 3-1 | 제7조 권리 | 열람·정정·삭제·처리정지 방법, 연락처, 기한 |
| 4-1 | 제8조 만 14세 미만 | 이용자는 교사로 한정, 학생 식별정보는 교사 기기에만 |
| 2-1 | 제9조 안전조치 | HTTPS, RLS, 승인제, 최소 권한, 보안 헤더, 비밀키 서버 보관 |
| 5-1 | 제10조 보호책임자 | 이름·연락처(17장 8번), 분쟁조정·침해신고 안내 |

### 13.4 앱 보호(선택)
두 교사가 함께, 학교 업무로 만든 앱이므로 권리관계를 먼저 정리한다(17장 9번). 정리 후 `dcheck protect`로 권리 안내, robots AI 수집기 차단, 산출물 해시를 적용하고 `dcheck verify`로 확인한다.

### 13.5 점검 시점
| 시점 | 할 일 |
|---|---|
| 파트 0 첫 배포 | 기준 점검 → 차단 0건 |
| 기능 하나 끝날 때(각자) | 13.2 자체 확인: 새 API 인증, 새 테이블 RLS, 키 |
| 합친 직후 | `scan` → `report`, 고치기 |
| 실제 사용 전 | 운영 DB로 재점검, 에듀집 서류(`edzip-autopilot`), 학운위 심의 |

## 14. 비기능 요구사항
- 휴대폰(390px)·태블릿·PC 모두 쓸 수 있어야 한다. 운영 일지·진행 현황은 한 손 조작
- 주요 화면 로딩 2초 이내(학생 300명, 일지 2,000건)
- 본문 16px 이상, 버튼 높이 44px 이상(휴대폰), 색만으로 상태를 구분하지 않기
- 크롬·엣지 최신 버전
- 오류 문구는 무엇이 잘못됐고 어떻게 고치는지 말한다.

## 15. 통합 시험
합친 뒤 제1부 **G6 체크리스트 15개**를 모두 통과해야 배포를 끝낸다. 실패한 항목은 그 화면의 주인 파트가 `fix-<내용>` 브랜치에서 고친다.

## 16. 일정
| 주 | A 선생님 | B 선생님 |
|---|---|---|
| 1주 | 준비, **파트 0** 완성 → main | 준비물 설치, 목업 살펴보기, 학교 양식 모으기 |
| 2주 | A1·A2·A3 | 저장소 받기, **B1 운영 일지** |
| 3주 | A4·A5 | **B2 시수 계산**, B3 |
| 4주 | A6·A7 | B4 |
| 5주 | A8·A9 | B5 |
| 6주 | **합치기(먼저)**, 통합 시험 | **합치기(두 번째)**, 통합 시험 |
| 이후 | dorms-check, 에듀집 서류, 학운위 심의 | 실제 운영 DB 준비 지원 |

## 17. 열린 질문
1. 2026 학교 보장지도 계획의 시수·한도 숫자(설정값만 바꾸면 됨)
2. 나이스 성적 엑셀 형식(샘플 필요, A5 추가 기능)
3. 학교 운영 일지·결과 보고서 양식(B5)
4. 학교·교육청 앱 점검·승인 절차와 일정
5. Google 로그인용 OAuth 설정 여부(안 되면 매직링크 유지)
6. ~~파트 분담~~: A 선생님 = 파트 A(담당자), B 선생님 = 파트 B
7. 앱 데이터 보유 기간(방침 제4조)
8. 개인정보 보호책임자(방침 제10조)
9. 앱 권리관계(공동 제작, 학교 업무)
10. 학운위 심의 대상 "학습지원 소프트웨어" 해당 여부

---

## 부록 A. 각자 AI에게 처음 줄 지시문

**파트 A (A 선생님 → A의 AI)**
```
이 저장소의 PRD.md와 CLAUDE.md를 끝까지 읽어 줘. 화면 모양은 docs/mockup/index.html이 기준이야.
너는 "파트 A" 담당이야. PRD 제2부 10장(A1~A9)을 순서대로 하나씩 구현해.
고쳐도 되는 곳: src/app/(a)/**, src/components/a/**, src/lib/a/**, src/lib/rules/scoring.ts(+테스트),
src/app/api/a/**, src/config/nav-a.ts, supabase/migrations/<타임스탬프>_a_*.sql
그 밖의 파일(파트 0, 파트 B)은 절대 고치지 마. 꼭 필요하면 고치지 말고 나에게 "공통 변경 요청" 내용을 써 줘.
작업은 part-a 브랜치에서만 하고 main에는 올리지 마.
기능 하나가 끝나면: npm run dev로 확인할 수 있게 알려 주고, PRD 완료 기준을 하나씩 확인해서 표로 보여 주고,
npm run build와 npm test가 통과하면 커밋해 줘. 하루 작업이 끝나면 part-a를 GitHub에 push해 줘.
학생 이름은 서버로 보내지 말고 화면에는 StudentName만 써.
PRD 13장 dorms-check 기준을 지켜: 새 API는 requireTeacher(), 비밀키는 서버에서만, dangerouslySetInnerHTML·eval 금지.
나는 개발 초보야. 내가 해야 하는 일은 어디를 누르면 되는지 쉬운 말로 한 단계씩 알려 줘.
```

**파트 B (B 선생님 → B의 AI)**
```
이 저장소의 PRD.md와 CLAUDE.md를 끝까지 읽어 줘. 화면 모양은 docs/mockup/index.html이 기준이야.
너는 "파트 B" 담당이야. PRD 제2부 11장(B1~B5)을 순서대로 하나씩 구현해. B1(운영 일지)과 B2(시수 계산)가 가장 중요해.
고쳐도 되는 곳: src/app/(b)/**, src/components/b/**, src/lib/b/**, src/lib/rules/hours.ts(+테스트),
src/app/api/b/**, src/config/nav-b.ts, supabase/migrations/<타임스탬프>_b_*.sql
그 밖의 파일(파트 0, 파트 A)은 절대 고치지 마. 꼭 필요하면 고치지 말고 나에게 "공통 변경 요청" 내용을 써 줘.
guidance_targets는 읽기만 해(consent_received만 예외). 파트 A 화면이 없어도 seed.sql의 확정 대상자로 만들어.
작업은 part-b 브랜치에서만 하고 main에는 올리지 마.
기능 하나가 끝나면: npm run dev로 확인할 수 있게 알려 주고, PRD 완료 기준을 하나씩 확인해서 표로 보여 주고,
npm run build와 npm test가 통과하면 커밋해 줘. 하루 작업이 끝나면 part-b를 GitHub에 push해 줘.
학생 이름은 서버로 보내지 말고 화면에는 StudentName만 써.
PRD 13장 dorms-check 기준을 지켜: 새 API는 requireTeacher(), 비밀키는 서버에서만, dangerouslySetInnerHTML·eval 금지.
나는 개발 초보야. 내가 해야 하는 일은 어디를 누르면 되는지 쉬운 말로 한 단계씩 알려 줘.
```

## 부록 B. 저장소 `CLAUDE.md`에 넣을 규칙 (파트 0이 작성)
```
# 보장지도 매니저 — AI 작업 규칙
- 먼저 PRD.md를 읽는다. 업무 규칙은 제2부 4장, 데이터는 7장, 파트 경계는 6.2, 보안은 13장, 화면은 docs/mockup/index.html.
- 자기 파트 폴더만 수정한다. 공통 파일 변경은 "공통 변경 요청"으로 사람에게 넘긴다.
- 작업은 자기 브랜치(part-a / part-b)에서만. main에 직접 push하지 않는다.
- 화면 문구는 한국어. 기준 숫자는 settings에서 읽고 하드코딩하지 않는다.
- 학생 이름을 DB·API·로그·AI 요청에 넣지 않는다. 이름 표시는 <StudentName>만 쓴다.
- 시수는 0.5 단위이므로 2배 정수로 계산한다. 원점수는 제2부 4.2 반올림 규칙을 따른다.
- 커밋 전: npm run build && npm test. 새 npm 패키지는 사람에게 먼저 알린다.
- dorms-check:
  - 새 테이블은 RLS를 켜고 anon 0행을 확인한다.
  - 새 API는 requireTeacher()로 막는다.
  - 비밀키는 서버 전용으로 쓰고 NEXT_PUBLIC_을 붙이지 않는다.
  - eval과 dangerouslySetInnerHTML을 쓰지 않는다.
  - CORS를 열지 않는다.
  - 민감정보를 저장하지 않는다.
  - 학생 정보를 console.log로 출력하지 않는다.
- 사용자는 개발 초보 교사다. 사람이 해야 할 일은 쉬운 말로 한 단계씩 안내한다.
```

## 부록 C. 용어
| 용어 | 뜻 |
|---|---|
| 원점수 | 반영비율 환산점수 합계를 정수로 반올림한 점수(나이스 기준) |
| 예상 원점수 | 학기 중 지금까지 들어온 점수로 미리 계산한 원점수 |
| 필요 시수 | 그 과목 보장지도의 총 운영 시수 |
| 인정 시수 | 한도를 적용해 이수에 인정되는 시수 |
| 대면지도 | 교사와 학생이 직접(또는 실시간 쌍방향 온라인으로) 만나는 지도 |
| 학관위 / 학운위 | 학업성적관리위원회 / 학교운영위원회 |
| 명렬표 | 학번과 이름이 있는 명단(교사 컴퓨터에만 둠) |
| 저장소·브랜치·PR·merge | 제1부 G1 참고 |
