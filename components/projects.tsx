"use client";
import { useState, useRef } from "react";
import {
  Plus,
  Heart,
  MessageCircle,
  ArrowUpRight,
  X,
  FolderCode,
  Search,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { External } from "./shared";
async function post(path: string, data: unknown) {
  const r = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const b = await r.json();
  if (!r.ok) throw new Error(b.error || "요청하지 못했습니다.");
  return b;
}
function thumbnail(p: Project) {
  if (p.image) return p.image;
  const id = p.videoUrl.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/)?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}
export default function Projects({
  initial,
  connected,
  error,
}: {
  initial: Project[];
  connected: boolean;
  error?: boolean;
}) {
  const [projects, setProjects] = useState(initial);
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const detail = useRef<HTMLDialogElement>(null);
  const add = useRef<HTMLDialogElement>(null);
  const p = projects.find((p) => p.id === selected);
  const visible = projects.filter(
    (p) =>
      (filter === "전체" || p.category === filter || p.status === filter) &&
      `${p.title} ${p.tech.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function update(p: Project) {
    setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }
  function open(p: Project) {
    setSelected(p.id);
    setFeedback("");
    detail.current?.showModal();
  }
  async function like(p: Project) {
    if (busy || liked.includes(p.id)) return;
    setBusy(true);
    setFeedback("");
    try {
      const b = await post(`/api/projects/${p.id}/like`, {});
      update({ ...p, likes: b.likes });
      setLiked((prev) => [...prev, p.id]);
    } catch (e) {
      setFeedback((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function comment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!p) return;
    const form = e.currentTarget;
    setBusy(true);
    setFeedback("");
    try {
      const b = await post(
        `/api/projects/${p.id}/comments`,
        Object.fromEntries(new FormData(form)),
      );
      update({ ...p, comments: b.comments });
      form.reset();
      setFeedback("댓글을 남겼습니다.");
    } catch (e) {
      setFeedback((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const b = await post("/api/projects", {
        ...Object.fromEntries(new FormData(e.currentTarget)),
        password,
      });
      setProjects((prev) => [b.project, ...prev]);
      add.current?.close();
      setAdding(false);
    } catch (e) {
      setFeedback((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="project-toolbar">
        <div className="filter-group" aria-label="프로젝트 필터">
          {["전체", "웹 프로젝트", "프로그램", "진행 중", "완료"].map((f) => (
            <button
              key={f}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
              className={f === filter ? "filter active" : "filter"}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          className="button primary"
          onClick={() => {
            setAdding(true);
            setVerified(false);
            setPassword("");
            setFeedback("");
            add.current?.showModal();
          }}
        >
          <Plus size={17} /> 프로젝트 추가
        </button>
      </div>
      <div className="results-line">
        <span>{visible.length}개의 프로젝트</span>
        <label className="search">
          <Search size={16} />
          <input
            aria-label="프로젝트 검색"
            placeholder="프로젝트, 기술 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p className="notice">
          프로젝트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}
      <div className="project-grid">
        {visible.map((p, i) => (
          <article className="project-card" key={p.id}>
            <button
              className={`project-cover cover-${i % 3}`}
              onClick={() => open(p)}
              aria-label={`${p.title} 상세 보기`}
            >
              {thumbnail(p) ? (
                <img
                  src={thumbnail(p)}
                  alt={`${p.title} 화면`}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <FolderCode size={56} />
              )}
              <span className="cover-open">
                <ArrowUpRight size={20} />
              </span>
              <span className="project-status">{p.status}</span>
            </button>
            <div className="project-content">
              <div><span className="chip project-category">{p.category}</span></div>
              <button className="title-button" onClick={() => open(p)}>
                <h2>{p.title}</h2>
              </button>
              <p>{p.summary}</p>
              <div className="chips">
                {p.tech.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="project-footer">
              <button
                disabled={!connected || busy || liked.includes(p.id)}
                aria-label={`${p.title} 좋아요`}
                aria-pressed={liked.includes(p.id)}
                onClick={() => like(p)}
              >
                <Heart
                  size={17}
                  fill={liked.includes(p.id) ? "currentColor" : "none"}
                />
                {p.likes}
              </button>
              <button onClick={() => open(p)}>
                <MessageCircle size={17} />
                {p.comments.length}
              </button>
              <button className="details-link" onClick={() => open(p)}>
                자세히 보기 <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <FolderCode />
          <h3>아직 해당하는 프로젝트가 없습니다.</h3>
          <p>다른 필터를 선택하거나 새로운 프로젝트를 추가해주세요.</p>
        </div>
      )}
      <p className="feedback" role="status">
        {!selected && !adding ? feedback : ""}
      </p>
      <dialog
        ref={detail}
        onClose={() => {
          setSelected(null);
          setFeedback("");
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) detail.current?.close();
        }}
      >
        <div className="dialog-panel">
          {p && (
            <>
              <div className="dialog-heading">
                <span className="eyebrow">PROJECT DETAIL</span>
                <button
                  className="icon-button"
                  aria-label="상세 닫기"
                  onClick={() => detail.current?.close()}
                >
                  <X />
                </button>
              </div>
              <h2>{p.title}</h2>
              <p>{p.summary}</p>
              <div className="chips">
                {p.tech.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <h3>주요 기능</h3>
              <ul className="feature-list">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="actions">
                {p.deployUrl && (
                  <External className="button primary" href={p.deployUrl}>
                    배포 사이트
                  </External>
                )}
                {p.githubUrl && (
                  <External className="button" href={p.githubUrl}>
                    GitHub
                  </External>
                )}
                {p.videoUrl && (
                  <External className="button" href={p.videoUrl}>
                    시연 영상
                  </External>
                )}
              </div>
              <div className="comment-section">
                <h3>
                  코멘트 <span className="accent">{p.comments.length}</span>
                </h3>
                {p.comments.length ? (
                  p.comments.map((c) => (
                    <article className="comment" key={c.id}>
                      <strong>{c.name}</strong>
                      <time>
                        {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                      </time>
                      <p>{c.content}</p>
                    </article>
                  ))
                ) : (
                  <p className="muted">
                    이 프로젝트의 첫 번째 코멘트를 남겨주세요.
                  </p>
                )}
                <form onSubmit={comment}>
                  <label>
                    이름
                    <input
                      name="name"
                      required
                      maxLength={40}
                      placeholder="이름 또는 닉네임"
                    />
                  </label>
                  <label>
                    코멘트
                    <textarea
                      name="content"
                      required
                      maxLength={1000}
                      rows={3}
                      placeholder="프로젝트에 대한 생각을 들려주세요."
                    />
                  </label>
                  <button
                    className="button primary"
                    disabled={busy || !connected}
                  >
                    {busy ? "저장 중…" : "코멘트 남기기"}
                  </button>
                </form>
                <p className="feedback" role="status">
                  {feedback}
                </p>
              </div>
            </>
          )}
        </div>
      </dialog>
      <dialog
        ref={add}
        onClose={() => {
          setAdding(false);
          setFeedback("");
        }}
      >
        <div className="dialog-panel">
          <div className="dialog-heading">
            <span className="eyebrow">ADD NEW PROJECT</span>
            <button
              className="icon-button"
              aria-label="추가 닫기"
              onClick={() => add.current?.close()}
            >
              <X />
            </button>
          </div>
          <h2>{verified ? "새 프로젝트" : "관리자 확인"}</h2>
          {!verified ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (password === "5425") {
                  setVerified(true);
                  setFeedback("");
                } else setFeedback("관리자 비밀번호가 올바르지 않습니다.");
              }}
            >
              <p className="muted">
                프로젝트를 추가하려면 관리자 비밀번호를 입력해주세요.
              </p>
              <label>
                관리자 비밀번호
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  autoFocus
                />
              </label>
              <button className="button primary">
                확인하고 계속하기 <ArrowUpRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={create}>
              <label>
                프로젝트 이름
                <input name="title" required maxLength={100} />
              </label>
              <div className="form-row">
                <label>
                  구분
                  <select name="category">
                    <option>웹 프로젝트</option>
                    <option>프로그램</option>
                    <option>기타</option>
                  </select>
                </label>
                <label>
                  상태
                  <select name="status">
                    <option>진행 중</option>
                    <option>완료</option>
                  </select>
                </label>
              </div>
              <label>
                간단한 설명
                <textarea name="summary" required maxLength={500} rows={3} />
              </label>
              <label>
                기술 스택
                <input
                  name="tech"
                  required
                  maxLength={2000}
                  placeholder="React, Next.js, MongoDB"
                />
              </label>
              <label>
                주요 기능
                <textarea
                  name="features"
                  required
                  maxLength={2000}
                  placeholder="기능을 줄바꿈 또는 쉼표로 구분해주세요."
                  rows={3}
                />
              </label>
              <label>
                배포 링크
                <input
                  name="deployUrl"
                  type="url"
                  required
                  placeholder="https://"
                />
              </label>
              <label>
                저장소 링크 (선택)
                <input
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/"
                />
              </label>
              <label>
                영상 링크 (선택)
                <input
                  name="videoUrl"
                  type="url"
                  placeholder="https://youtu.be/"
                />
              </label>
              <label>
                대표 이미지 주소 (선택)
                <input name="image" type="url" placeholder="https://" />
              </label>
              <button disabled={busy || !connected} className="button primary">
                {busy ? "저장 중…" : "프로젝트 저장"} <Plus size={16} />
              </button>
              {!connected && (
                <p className="notice">MongoDB 연결 후 저장할 수 있습니다.</p>
              )}
            </form>
          )}
          <p className="feedback" role="status">
            {feedback}
          </p>
        </div>
      </dialog>
    </>
  );
}
