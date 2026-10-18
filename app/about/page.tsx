import { PageTitle, External } from "@/components/shared";
import { profile, studies } from "@/lib/content";
import Contact from "@/components/contact";
import MessageInbox from "@/components/message-inbox";
import { ArrowUpRight, Code2 } from "lucide-react";
export const metadata = { title: "About Me" };
export default function About() {
  return (
    <div className="container">
      <PageTitle
        number="03"
        title="About Me"
      />
      <section className="about-grid">
        <div className="profile-card">
          <div className="avatar">
            JM
            <span />
          </div>
          <h2>박지민</h2>
          <p>
            웹 개발과 정보보호를 공부하며,
            <br />
            배운 것을 직접 구현하는 개발자입니다.
          </p>
          <div className="profile-tags">
            <span className="chip">중부대학교</span>
            <span className="chip">멋쟁이사자처럼 14기</span>
          </div>
          <div className="profile-links">
            <div>
              <span>EMAIL</span>
              {profile.email ? (
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              ) : (
                <span className="muted">이메일 등록 예정</span>
              )}
            </div>
            <div>
              <span>GITHUB</span>
              <External href={profile.github}>wlals0693</External>
            </div>
            <div>
              <span>BLOG</span>
              <External href={profile.blog}>jimin0703.tistory.com</External>
            </div>
          </div>
        </div>
        <div className="about-story">
          <h2>활동 현황</h2>
          <div className="activity">
            <span>01</span>
            <div>
              <h3>중부대학교 · 정보보호학과</h3>
              <p>2023년 입학, 2026년 복학 후 웹 개발과 보안 학습</p>
            </div>
          </div>
          <div className="activity">
            <span>02</span>
            <div>
              <h3>멋쟁이사자처럼 14기</h3>
              <p>PBL 과제와 프로젝트를 통해 함께 배우고 구현하는 경험</p>
            </div>
          </div>
          <div className="activity">
            <span>03</span>
            <div>
              <h3>네트워크 관리사 2급</h3>
              <p>네트워크와 시스템에 대한 기초 역량</p>
            </div>
          </div>
          <div className="activity"><span>04</span><div><h3>멋쟁이사자처럼 중앙해커톤</h3><p>Best Potential상 수상</p></div></div>
          <div className="activity"><span>05</span><div><h3>어흥콘</h3><p>참신 부문 우수상 수상</p></div></div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CURRENTLY LEARNING</span>
            <h2>지금 공부하는 분야</h2>
          </div>
          <Code2 className="accent" />
        </div>
        <div className="study-grid">
          {studies.map(([name, desc, img]) => (
            <article className="study-card" key={name}>
              <img src={`/media/${img}`} alt="" />
              <h3>{name}</h3>
              <p>{desc}</p>
              <span className="small-label">LEARNING IN PROGRESS</span>
            </article>
          ))}
        </div>
      </section>
      <section className="contact-section">
        <div>
          <h2>메시지를 남겨주세요</h2>
        </div>
        <Contact />
        <MessageInbox />
      </section>
    </div>
  );
}
