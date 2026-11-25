export const profile = {
  name: "박지민",
  github: "https://github.com/wlals0693",
  blog: "https://jimin0703.tistory.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "example@gmail.com",
  courseRepo:
    process.env.NEXT_PUBLIC_COURSE_REPO_URL ||
    "https://github.com/wlals0693/server_programming",
  courseDeploy:
    process.env.NEXT_PUBLIC_COURSE_DEPLOY_URL ||
    "https://serverprogramming.vercel.app/",
};
export const current = {
  name: "AI 디지털 옷장 서비스",
  period: "2026.09.24 ~ 2026.12.14 (목표)",
  stack: ["Next.js", "React", "FastAPI", "Supabase"],
  milestones: [
    { title: "기획 및 요구사항 정의", status: "완료" },
    { title: "UX / User Flow 설계", status: "완료" },
    { title: "시스템 및 AI 아키텍처 설계", status: "완료" },
    {
      title: "FashionCLIP 추론 및 Compatibility 모델 초기 실행 검증",
      status: "완료",
    },
    { title: "실제 의류 데이터 기반 AI 품질 검증", status: "진행 과제" },
    { title: "웹서비스 기능 개발 및 통합", status: "진행 과제" },
    { title: "테스트 및 배포", status: "예정" },
  ],
  repo: process.env.NEXT_PUBLIC_CURRENT_REPO_URL || "",
  deploy:
    process.env.NEXT_PUBLIC_CURRENT_DEPLOY_URL ||
    "https://wep-midterm.vercel.app/",
  video: "https://youtu.be/4m1xxSp8eco",
};
export const studies = [
  [
    "React",
    "컴포넌트와 상태 관리로 사용하기 좋은 인터페이스를 만듭니다.",
    "react.webp",
  ],
  [
    "JavaScript",
    "이벤트와 비동기 처리를 이해하고 웹에 동작을 더합니다.",
    "js.webp",
  ],
  ["Java", "객체지향 설계와 안정적인 프로그램 구조를 공부합니다.", "java.webp"],
  ["Spring", "서버 API 설계와 데이터베이스 연동을 공부합니다.", "spring.webp"],
];
