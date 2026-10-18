# 박지민 Portfolio

React · Next.js App Router · TypeScript · MongoDB/Mongoose로 만든 개인 포트폴리오입니다. 기존 `portfolio-main.zip`의 파란색 포인트, 라이트/다크 모드, 자기소개·프로젝트 정보·필터·상세 보기 구성을 참고했습니다.

## 실행

Node.js 24 권장. PowerShell에서는 실행 정책에 따라 `npm` 대신 `npm.cmd`를 사용합니다.

```powershell
npm.cmd install
Copy-Item .env.example .env.local
# .env.local의 MONGODB_URI와 실제 링크/이메일 입력
npm.cmd run seed
npm.cmd run dev
```

http://localhost:3000 에서 확인합니다. DB가 설정되지 않았을 때 프로젝트 페이지는 기존 5개 프로젝트를 읽기 전용으로 미리 보여줍니다. DB에 저장되지 않은 데이터를 저장 완료로 표시하지 않습니다. MongoDB 연결 후 `npm.cmd run seed`를 실행하면 기존 5개가 실제 DB에 추가됩니다. 시드 재실행 시 기존 프로젝트·좋아요·댓글은 유지됩니다.

## 페이지와 기능

| 경로        | 구성                                                                         |
| ----------- | ---------------------------------------------------------------------------- |
| `/`         | 소개, 프로젝트/자기소개 링크, 활동, 티스토리 RSS 최근 글 3개, 수업 실습 링크 |
| `/projects` | 카드, 구분·상태 필터, 검색, 상세 모달, 프로젝트 추가, 좋아요, 코멘트         |
| `/current`  | 기존 사이버 보안 교육 프로젝트 소개, 진행 상태, 주요 기능, 아키텍처          |
| `/about`    | 자기소개, 활동, 공부하는 기술, 비공개 메시지 전송                            |

프로젝트·좋아요·코멘트는 `projects` 컬렉션, 메시지는 `messages` 컬렉션에 저장됩니다. 테마 선택만 localStorage에 저장합니다. 메시지 이메일과 본문은 공개 조회 API로 제공하지 않습니다.

관리자 비밀번호는 요청에 따라 **5425**입니다. `app/api/projects/route.ts`에서 저장 요청마다 확인합니다. 좋아요는 httpOnly 방문자 쿠키와 MongoDB 원자적 조건 갱신으로 같은 브라우저의 반복 클릭을 막습니다. 쿠키 삭제에 따른 재투표까지 막는 계정 인증 방식은 아닙니다.

## 발표 전 실제 정보 입력

`.env.local`과 Vercel 환경변수에 아래 값을 설정하세요. 공개 환경변수 변경 후 재배포해야 화면에 반영됩니다.

- `MONGODB_URI`: 실제 Atlas 연결 문자열 (서버 전용)
- `MONGODB_DB`: 기본 `portfolio`
- `NEXT_PUBLIC_CONTACT_EMAIL`: 실제 이메일 (원본의 example@email.com은 사용하지 않았습니다.)
- `NEXT_PUBLIC_COURSE_REPO_URL`: **본인의 현재 수업 실습 저장소**
- `NEXT_PUBLIC_COURSE_DEPLOY_URL`: **본인의 현재 수업 실습 배포 주소**
- `NEXT_PUBLIC_CURRENT_REPO_URL`: 진행 프로젝트 저장소
- `NEXT_PUBLIC_CURRENT_DEPLOY_URL`: 기본값은 원본의 https://wep-midterm.vercel.app/

Current Project는 참고 자료에서 확인한 사이버 보안 교육 프로젝트로 구성했습니다. 실제 프로젝트가 다르면 `lib/content.ts`, `app/current/page.tsx`를 수정하세요. 진행률은 근거 없는 숫자를 만들지 않고 확인 대기로 표시했습니다. `.progress-track`과 설명을 실제 진행 상황으로 바꿀 수 있습니다.

현재 프로젝트는 원본 코드의 확인된 구조에 맞춰 HTML/CSS/JavaScript와 외부 API로 설명했습니다. 이 포트폴리오 자체의 구조는 `브라우저 → Next.js 페이지/클라이언트 컴포넌트 → Route Handler → Mongoose → MongoDB Atlas`입니다.

## Vercel 배포

1. 이 폴더를 개인 GitHub 저장소에 push합니다. `.env.local`은 커밋하지 않습니다.
2. Vercel에서 해당 저장소를 Import하고 Framework Preset을 Next.js로 선택합니다.
3. 위 환경변수를 등록하고 Atlas에서 배포 서버의 접속을 허용합니다.
4. Deploy 후 배포 주소를 확인합니다. 시드는 로컬에서 동일한 Atlas DB에 한 번 실행하면 됩니다.
5. HOME 수업 저장소·배포 링크, 프로젝트 추가(5425), 좋아요, 코멘트, 메시지를 실제 배포 사이트에서 확인합니다.
6. 팀장에게 개인 홈페이지 저장소 주소와 배포 주소를 전달합니다.

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

RSS는 서버에서 티스토리 RSS를 가져오고 10분간 캐시합니다. 외부 응답 실패 시 블로그 바로가기를 표시합니다. 프로젝트 이미지 일부와 기술/소속 로고는 원본 ZIP에서 가져왔고, 영상 프로젝트는 YouTube 썸네일을 활용합니다. 현재 프로젝트에는 임의의 스크린샷 대신 코드로 만든 소개 이미지를 사용했습니다.
