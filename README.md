# 보장지도 매니저

직업계고 최소 성취수준 보장지도(예방·보충지도, 추가 학습) 업무를 한곳에서 처리하는 교사용 웹앱이에요.

- 설계서: [PRD.md](PRD.md). 제1부는 선생님용 가이드, 제2부는 제품 명세예요.
- 화면 기준: [docs/mockup/index.html](docs/mockup/index.html)
- AI 작업 규칙: [CLAUDE.md](CLAUDE.md)

## 내 컴퓨터에서 실행하기

1. Node.js(LTS)와 Git을 설치해요(PRD 제1부 G2).
2. 이 폴더에서 `npm install`을 실행해요.
3. `.env.example`을 복사해서 `.env.local`을 만들고 값을 채워요(PRD 제2부 6.5).
4. `npm run dev`를 실행한 뒤 브라우저에서 http://localhost:3000 을 열어요.

## 자주 쓰는 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 내 컴퓨터에서 앱 실행 |
| `npm run build` | 배포 전 오류 확인 |
| `npm test` | 점수·시수 규칙 자동 테스트 |
| `npm run test:rls` | 로그인 없이 DB가 0행인지 확인(dorms-check) |
| `npm run db:setup` | DB 테이블 만들기 + 가짜 데이터 넣기(A 선생님, 처음 한 번) |
| `npm run db:seed` | 가짜 데이터만 다시 넣기 |

## 꼭 지킬 것

- **실제 학생 정보를 넣지 않아요.** 점검과 학교 승인이 끝날 때까지 가짜 데이터만 써요.
- `.env.local`은 GitHub에 올리지 않아요(이미 `.gitignore`에 들어 있어요).
- `main`에 직접 올리지 않고, 자기 브랜치(`part-a` / `part-b`)에서 작업해요.
