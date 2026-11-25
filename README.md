# 박지민 Portfolio

Next.js App Router · React · TypeScript · MongoDB/Mongoose · Auth.js 기반 개인 포트폴리오입니다.

## 실행

Node.js 24 권장. `.env.local`이 이미 있다면 덮어쓰지 마세요.

```powershell
npm.cmd install
# 최초 실행 시 .env.example을 .env.local로 복사하고 MONGODB_URI 설정
npm.cmd run setup:auth
npm.cmd run seed
npm.cmd run dev
```

`setup:auth`는 랜덤 AUTH_SECRET를 로컬 환경변수 파일에 생성하고 값을 출력하지 않습니다. AUTH_SECRET가 없거나 너무 짧으면 인증 설정이 명확한 오류로 중단됩니다. 환경변수 파일은 Git에서 제외됩니다.

## 기말 개선 사항

- Auth.js Credentials 로그인, bcrypt 해시 저장, JWT 세션과 httpOnly 쿠키
- 회원가입은 무조건 `user`, 관리자 승격은 서버 접근이 가능한 운영자만 수행
- 프로젝트 등록·수정·삭제, 진행 상태 변경, 받은 메시지 조회는 관리자 전용
- 댓글 작성자 이름·ID는 로그인 계정에서 결정 (클라이언트 작성자 값 무시)
- 댓글 수정은 본인만 가능, 삭제는 본인 또는 관리자 가능
- 기존 익명 댓글은 그대로 보존하며 관리자만 삭제 가능
- DB 조건에 프로젝트 ID·댓글 ID·작성자 ID를 함께 넣어 IDOR 수정·삭제 차단
- 서버에서 현재 DB 역할을 재확인하여 기존 로그인 세션에도 권한 회수 반영
- 기존의 공통 관리자 비밀번호 방식은 제거

| 구분   | 권한                                                              |
| ------ | ----------------------------------------------------------------- |
| 방문자 | 페이지·프로젝트·댓글 열람, 좋아요, 비공개 메시지 전송             |
| user   | 방문자 기능 + 댓글 작성·본인 댓글 수정/삭제                       |
| admin  | user 기능 + 프로젝트 관리, 진행 상태 관리, 메시지 조회, 댓글 삭제 |

UI 버튼 표시뿐 아니라 각 API에서 서버 권한을 검사합니다. 관리자가 다른 회원의 댓글을 대신 수정할 수는 없습니다.

## 관리자 계정 설정

1. `/register`에서 실제 관리자 이메일로 회원가입합니다. 비밀번호는 사이트에서 직접 설정합니다.
2. 로컬에서 해당 계정을 승격합니다.

```powershell
npm.cmd run admin -- 실제가입한이메일
```

임의 이메일을 자동으로 관리자로 만들거나 첫 가입자를 관리자로 지정하지 않습니다. 스크립트는 이미 가입한 계정만 변경합니다. 로그인 후 프로젝트 상세에서 수정/삭제, Current Project에서 진행 상태 수정, About Me에서 받은 메시지 조회를 사용할 수 있습니다.

## 데이터

- `projects`: 기존 프로젝트와 좋아요·댓글. 기존 데이터·익명 댓글 보존
- `users`: 이름·이메일·비밀번호 해시·역할. 비밀번호 해시는 공개 반환하지 않음
- `messages`: 비공개 메시지. 관리자만 조회
- `currentstatuses`: 현재 프로젝트 상태. 미등록 상태에서는 기존 기획·진행 내역을 표시하고 관리자 저장 시 DB에 기록

진행 단계 변경은 실제 완료 여부에 맞춰 입력합니다. 좋아요는 기존 방문자 쿠키 기반이며 계정 기반 좋아요로 바꾸지 않았습니다. 쿠키 초기화까지 막는 장치는 아닙니다.

## 검증

```powershell
npm.cmd run build
npm.cmd run start -- --port 3001
# 다른 터미널
npm.cmd run verify:auth
```

검증 스크립트는 임시 user A·B·admin을 만들어 실제 Auth.js 로그인 과정을 거칩니다. role 입력 조작, 비로그인 401, 일반회원 403, 타인 댓글 IDOR 404, 본인 댓글 수정/삭제, 관리자 프로젝트 관리·메시지 조회·진행 상태 저장, 권한 회수 반영을 검사합니다. 기존 데이터는 유지하고 검증용 계정과 프로젝트만 정리하며, 진행 상태는 원래 값으로 복원합니다. 실제 메시지 내용은 출력하지 않습니다.

다른 주소 검사 시 `TEST_BASE_URL`을 지정합니다. `node scripts/verify-db.mjs`도 같은 검증을 실행합니다.

## 배포

GitHub main 브랜치에 push하면 Vercel이 자동 배포합니다. Vercel의 Production 환경에는 `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`를 설정해야 합니다. Preview에서도 인증을 쓰려면 별도로 환경변수를 등록해야 합니다. AUTH_SECRET는 배포마다 재생성하지 않습니다.

Vercel CLI 로그인 및 프로젝트 연결 후 `node scripts/configure-vercel.mjs`를 실행하면 로컬의 위 3개 값을 stdin으로 전달하여 운영 환경에 등록합니다. 값은 로그나 명령 인자로 출력하지 않습니다.

Auth.js 참고: https://authjs.dev/getting-started/authentication/credentials · https://authjs.dev/guides/role-based-access-control

현재 작업 범위는 역할·소유권 검증과 기존 기능 개선입니다. 이메일 인증·비밀번호 재설정·분산 Rate Limiting은 별도 확장 과제입니다.
