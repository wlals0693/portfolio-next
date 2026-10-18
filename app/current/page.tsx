import { PageTitle } from "@/components/shared";
import { current } from "@/lib/content";
import { Shirt, Check, Circle, ArrowUpRight } from "lucide-react";

export const metadata = { title: "Current Project" };
const features = [
  { title: "AI 기반 디지털 옷장", body: "의류 사진을 등록하면 FashionCLIP으로 이미지 특징을 추출하고, 카테고리·색상·스타일 등의 정보를 제안합니다. 사용자는 분석 결과를 확인하고 수정하여 자신만의 디지털 옷장을 구성할 수 있습니다." },
  { title: "개인 맞춤 코디 추천", body: "보유 의류로 가능한 코디 후보를 생성하고, 별도의 Compatibility 모델로 의류 간 조합을 평가합니다. 사용자 취향, 날씨, 외출 상황, 착용 기록 등을 반영해 추천 순서를 개인화하며, 특정 옷을 고정한 코디 추천도 지원하도록 설계했습니다." },
  { title: "Wardrobe Utility — 구매 전 활용도 분석", body: "구매 예정 의류를 기존 옷장과 비교해 함께 활용할 수 있는 옷과 가능한 코디를 분석합니다.", emphasis: "새 상품으로 만들 수 있는 코디와 이미 보유한 비슷한 옷으로도 만들 수 있는 코디를 구분하여, 실질적으로 추가되는 조합을 파악할 수 있도록 설계했습니다." },
  { title: "착용 기록 및 옷장 분석", body: "사용자가 선택하거나 직접 기록한 코디를 바탕으로 의류 활용 현황을 확인합니다. 자주 기록되는 옷과 최근 기록이 없는 옷을 구분하고, 사용자가 활용하기 어려운 옷을 다시 코디해 보거나 추천에서 제외할 수 있도록 지원합니다." },
];

export default function Current() {
  return <div className="container wardrobe-page">
    <PageTitle number="02" title="Current Project" description="현재 진행중인 프로젝트를 소개합니다." />
    <section className="current-overview">
      <div className="current-visual wardrobe-visual">
        <Shirt size={86} strokeWidth={1} />
        <span className="small-label">AI DIGITAL WARDROBE</span>
        <h2>내 옷장의 가능성을,<br />한 조합 더.</h2>
        <div className="chips"><span className="chip">Digital Wardrobe</span><span className="chip">Compatibility</span><span className="chip">Wardrobe Utility</span></div>
      </div>
      <div className="current-copy">
        <h2>{current.name}</h2>
        <p className="wardrobe-tagline">내 옷장을 이해하고, 더 나은 코디와 구매 판단을 돕는 AI 서비스</p>
        <p>보유한 의류를 디지털 옷장에 등록하고, AI가 의류의 특징과 조합을 분석하여 개인 맞춤 코디를 추천합니다. 나아가 구매를 고민하는 옷이 기존 옷장에 얼마나 잘 어울리고, 실제로 어떤 새로운 조합을 만들어낼 수 있는지 분석합니다.</p>
        <p>단순한 코디 추천을 넘어 <strong>이미 가진 옷을 더 잘 활용하는 것</strong>을 목표로 합니다.</p>
        <div className="chips">{current.stack.map(t=><span className="chip" key={t}>{t}</span>)}</div>
        <p className="project-period"><span>개발 기간</span> {current.period}</p>
      </div>
    </section>
    <section className="section progress-section progress-section-full" aria-labelledby="development-status">
      <div className="progress-card">
        <div className="section-heading"><h2 id="development-status">현재 개발 진행 상태</h2><span className="chip">AI 품질 검증 · 서비스 개발 단계</span></div>
        <p className="status-summary">기획 및 기술 설계 완료, AI 초기 기술 검증 완료. 현재는 실제 모델 품질 검증과 서비스 개발을 진행하는 단계입니다.</p>
        <ol className="milestone-list">{current.milestones.map((step,i)=><li key={step.title} className={step.status==="완료"?"milestone completed":"milestone"}><span className="milestone-icon" aria-hidden="true">{step.status==="완료"?<Check size={17}/>:<Circle size={15}/>}</span><span className="milestone-number">{String(i+1).padStart(2,"0")}</span><span className="milestone-title">{step.title}</span><span className={`milestone-status ${step.status==="예정"?"planned":""}`}>{step.status}</span></li>)}</ol>
        <p className="validation-note">초기 실행 검증은 모델이 실행되는지 확인한 단계이며, 실제 의류 데이터에서의 추천 품질이나 전체 서비스 완성을 의미하지 않습니다.</p>
      </div>
    </section>
    <section className="section" aria-labelledby="wardrobe-features"><div className="section-heading"><h2 id="wardrobe-features">핵심 기능</h2><span className="muted">기획·설계한 서비스 기능</span></div><div className="wardrobe-feature-grid">{features.map((f,i)=><article className="feature-card" key={f.title}><span className="eyebrow">{String(i+1).padStart(2,"0")}</span><h3>{f.title}</h3><p>{f.body}</p>{f.emphasis&&<p><strong>{f.emphasis}</strong></p>}</article>)}</div></section>
    <section className="section wardrobe-difference" aria-labelledby="wardrobe-difference"><span className="eyebrow">WARDROBE UTILITY</span><h2 id="wardrobe-difference">새 옷이 더해주는, 실질적인 활용 범위</h2><p>기존 디지털 옷장의 일반적인 의류 관리 및 코디 추천 기능에서 나아가, <strong>새 옷이 내 옷장에 실질적으로 더해주는 활용 범위</strong>를 분석하는 Wardrobe Utility에 초점을 맞췄습니다.</p><p>FashionCLIP의 이미지 유사도만으로 코디의 어울림을 판단하지 않고, 의류 간 Compatibility 평가와 사용자 개인화, 기존 옷의 대체 가능성 분석을 분리하여 설계했습니다.</p></section>
    <section className="section architecture"><span className="eyebrow">ARCHITECTURE</span><h2>서비스 아키텍쳐</h2><p className="muted">서비스가 돌아가는 과정을 시각적으로 정리했습니다.</p><figure className="wardrobe-architecture"><a href="/media/wardrobe-architecture.png" target="_blank" rel="noopener noreferrer" aria-label="서비스 아키텍처 이미지 원본 크게 보기"><img src="/media/wardrobe-architecture.png" width={1682} height={412} alt="사용자에서 Next.js 웹, FastAPI 서버, Python AI 엔진, FashionCLIP 의류 특징 추출, 코디 궁합 및 개인화 추천, 코디 추천과 구매 활용도 분석으로 연결되는 구조. FastAPI는 Supabase 인증·데이터베이스·사진 저장소와 연결됩니다." /></a><figcaption>Next.js · React / FastAPI · Python / Supabase <a href="/media/wardrobe-architecture.png" target="_blank" rel="noopener noreferrer">이미지 크게 보기 <ArrowUpRight size={14}/></a></figcaption></figure><p className="architecture-caption">설계 기준 구조입니다. 코디 조합 평가에는 별도의 Compatibility 모델을 사용하며, 실제 의류 데이터 기반 품질 검증은 진행 과제입니다.</p></section>
  </div>;
}
