import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getPosts } from "@/lib/blog";
import { profile } from "@/lib/content";
import { External } from "@/components/shared";
import VisitMessage from "@/components/visit-message";

export default async function Home() {
  const posts = await getPosts();
  return <div className="container home-page">
    <section className="home-intro">
      <VisitMessage />
      <h1>My <span className="accent">Portfolio</span></h1>
      <div className="actions"><Link className="button primary" href="/projects">프로젝트 보기</Link><Link className="button" href="/about">소개 보기</Link></div>
    </section>
    <section className="home-affiliation-grid" aria-label="소속 및 활동">
      <article className="home-affiliation-card"><div className="affiliation-icon"><img src="/media/likelion.png" alt="멋쟁이사자처럼" /></div><h2>멋쟁이사자처럼</h2><p>중앙동아리 멋쟁이사자처럼에서 14기 아기사자로 활동하며 함께 공부하고 있습니다.</p><External className="button primary" href="https://likelion.university/">멋사 홈페이지</External></article>
      <article className="home-affiliation-card"><div className="affiliation-icon"><img src="/media/joongbu.svg" alt="중부대학교" /></div><h2>중부대학교</h2><p>중부대학교 23학번으로 입학 후 2026년에 복학해서 다시 공부를 시작한 복학생입니다.</p><External className="button primary" href="https://www.joongbu.ac.kr/">중부대 홈페이지</External></article>
    </section>
    <section className="section home-section"><div className="section-heading"><h2>둘러보기</h2></div><div className="explore-grid">{[
      ["01", "Personal Project", "개인 과제와 프로젝트 결과물을 카드와 상세 보기로 정리했습니다.", "/projects"],
      ["02", "Current Project", "현재 진행 중인 프로젝트의 소개와 진행 과정을 확인할 수 있습니다.", "/current"],
      ["03", "About Me", "관심 분야, 사용 기술, 연락 정보를 정리했습니다.", "/about"],
    ].map(([n,title,desc,url])=><Link href={url} key={n} className="explore-card"><div className="card-top"><span>{n}</span></div><h3>{title}</h3><p>{desc}</p></Link>)}</div></section>
    <section className="section home-section"><div className="section-heading"><h2>최근 블로그 글</h2></div><div className="blog-grid">{posts.length ? posts.map(p=><article className="blog-card" key={p.link}><time>{p.date}</time><h3>{p.title}</h3><External className="button" href={p.link}>글 보러가기</External></article>) : <div className="empty-state"><BookOpen/><p>블로그 글을 불러오지 못했습니다.</p><External href={profile.blog}>티스토리 방문하기</External></div>}</div></section>
    <section className="course-strip"><div><h3>웹서버보안프로그래밍 실습 프로젝트</h3></div><div className="actions"><External className="button" href={profile.courseRepo}>실습 저장소</External><External className="button primary" href={profile.courseDeploy}>실습 배포 사이트</External></div></section>
  </div>;
}
