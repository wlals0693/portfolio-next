"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
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
async function request(path: string, data?: unknown, method = "POST") {
  const r = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
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
  const { data: session } = useSession();
  const user = session?.user;
  const admin = user?.role === "admin";
  const [projects, setProjects] = useState(initial);
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const detail = useRef<HTMLDialogElement>(null);
  const editor = useRef<HTMLDialogElement>(null);
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
    setEditingComment(null);
    detail.current?.showModal();
  }
  function edit(p: Project | null) {
    setEditingProject(p);
    setAdding(true);
    setFeedback("");
    editor.current?.showModal();
  }
  async function act(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setFeedback("");
    try {
      await task();
    } catch (e) {
      setFeedback((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function like(p: Project) {
    if (liked.includes(p.id)) return;
    await act(async () => {
      const b = await request(`/api/projects/${p.id}/like`, {});
      update({ ...p, likes: b.likes });
      setLiked((prev) => [...prev, p.id]);
    });
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    await act(async () => {
      const b = await request(
        editingProject ? `/api/projects/${editingProject.id}` : "/api/projects",
        values,
        editingProject ? "PATCH" : "POST",
      );
      if (editingProject) update(b.project);
      else setProjects((prev) => [b.project, ...prev]);
      editor.current?.close();
      setFeedback(
        editingProject
          ? "프로젝트를 수정했습니다."
          : "프로젝트를 추가했습니다.",
      );
    });
  }
  async function removeProject(p: Project) {
    if (
      !window.confirm(
        `‘${p.title}’ 프로젝트와 댓글을 삭제할까요? 되돌릴 수 없습니다.`,
      )
    )
      return;
    await act(async () => {
      await request(`/api/projects/${p.id}`, undefined, "DELETE");
      detail.current?.close();
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
      setFeedback("프로젝트를 삭제했습니다.");
    });
  }
  async function writeComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!p) return;
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    await act(async () => {
      const b = await request(`/api/projects/${p.id}/comments`, values);
      update({ ...p, comments: b.comments });
      form.reset();
      setFeedback("댓글을 남겼습니다.");
    });
  }
  async function changeComment(id: string, remove = false) {
    if (!p) return;
    if (remove && !window.confirm("이 댓글을 삭제할까요?")) return;
    await act(async () => {
      const b = await request(
        `/api/projects/${p.id}/comments/${id}`,
        remove ? undefined : { content: commentDraft },
        remove ? "DELETE" : "PATCH",
      );
      update({ ...p, comments: b.comments });
      setEditingComment(null);
      setFeedback(remove ? "댓글을 삭제했습니다." : "댓글을 수정했습니다.");
    });
  }
  return (
    <>
      <div className="project-toolbar">
        <div className="filter-group" aria-label="프로젝트 필터">
          {["전체", "웹 프로젝트", "프로그램", "진행 중", "완료"].map((f) => (
            <button
              key={f}
              className={f === filter ? "filter active" : "filter"}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        {admin && (
          <button className="button primary" onClick={() => edit(null)}>
            <Plus size={17} /> 프로젝트 추가
          </button>
        )}
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
              <div>
                <span className="chip project-category">{p.category}</span>
              </div>
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
          setEditingComment(null);
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
              {admin && (
                <div className="actions admin-actions">
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => edit(p)}
                  >
                    프로젝트 수정
                  </button>
                  <button
                    className="button danger"
                    disabled={busy}
                    onClick={() => removeProject(p)}
                  >
                    프로젝트 삭제
                  </button>
                </div>
              )}
              <div className="comment-section">
                <h3>
                  코멘트 <span className="accent">{p.comments.length}</span>
                </h3>
                {p.comments.length ? (
                  p.comments.map((c) => (
                    <article className="comment" key={c.id}>
                      <strong>{c.name}</strong>
                      {!c.authorId && (
                        <span className="legacy-label">기존 익명 댓글</span>
                      )}
                      <time>
                        {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                      </time>
                      {editingComment === c.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            void changeComment(c.id);
                          }}
                        >
                          <label>
                            댓글 수정
                            <textarea
                              required
                              maxLength={1000}
                              value={commentDraft}
                              onChange={(e) => setCommentDraft(e.target.value)}
                            />
                          </label>
                          <div className="actions">
                            <button className="button primary" disabled={busy}>
                              저장
                            </button>
                            <button
                              className="button"
                              type="button"
                              onClick={() => setEditingComment(null)}
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p>{c.content}</p>
                      )}
                      {(c.authorId === user?.id || admin) && (
                        <div className="comment-controls">
                          {c.authorId === user?.id && (
                            <button
                              className="button"
                              disabled={busy}
                              onClick={() => {
                                setEditingComment(c.id);
                                setCommentDraft(c.content);
                              }}
                            >
                              수정
                            </button>
                          )}
                          <button
                            className="button danger"
                            disabled={busy}
                            onClick={() => changeComment(c.id, true)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="muted">
                    이 프로젝트의 첫 번째 코멘트를 남겨주세요.
                  </p>
                )}
                {user ? (
                  <form onSubmit={writeComment}>
                    <p className="muted">{user.name} 님으로 작성합니다.</p>
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
                ) : (
                  <p className="notice">
                    댓글을 작성하려면 <Link href="/login">로그인</Link>해주세요.
                  </p>
                )}
                <p className="feedback" role="status">
                  {feedback}
                </p>
              </div>
            </>
          )}
        </div>
      </dialog>
      <dialog
        ref={editor}
        onClose={() => {
          setAdding(false);
          setEditingProject(null);
        }}
      >
        <div className="dialog-panel">
          <div className="dialog-heading">
            <span className="eyebrow">MANAGE PROJECT</span>
            <button
              className="icon-button"
              aria-label="편집 닫기"
              onClick={() => editor.current?.close()}
            >
              <X />
            </button>
          </div>
          <h2>{editingProject ? "프로젝트 수정" : "새 프로젝트"}</h2>
          {admin && (
            <form key={editingProject?.id || "new"} onSubmit={save}>
              <label>
                프로젝트 이름
                <input
                  name="title"
                  required
                  maxLength={100}
                  defaultValue={editingProject?.title}
                />
              </label>
              <div className="form-row">
                <label>
                  구분
                  <select
                    name="category"
                    defaultValue={editingProject?.category || "웹 프로젝트"}
                  >
                    {["웹 프로젝트", "프로그램", "기타"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  상태
                  <select
                    name="status"
                    defaultValue={editingProject?.status || "진행 중"}
                  >
                    <option>진행 중</option>
                    <option>완료</option>
                  </select>
                </label>
              </div>
              <label>
                간단한 설명
                <textarea
                  name="summary"
                  required
                  maxLength={500}
                  rows={3}
                  defaultValue={editingProject?.summary}
                />
              </label>
              <label>
                기술 스택
                <input
                  name="tech"
                  required
                  maxLength={2000}
                  placeholder="React, Next.js, MongoDB"
                  defaultValue={editingProject?.tech.join(", ")}
                />
              </label>
              <label>
                주요 기능
                <textarea
                  name="features"
                  required
                  maxLength={2000}
                  rows={3}
                  placeholder="줄바꿈 또는 쉼표로 구분해주세요."
                  defaultValue={editingProject?.features.join("\n")}
                />
              </label>
              <label>
                배포 링크 (선택)
                <input
                  name="deployUrl"
                  type="url"
                  defaultValue={editingProject?.deployUrl}
                  placeholder="https://"
                />
              </label>
              <label>
                저장소 링크 (선택)
                <input
                  name="githubUrl"
                  type="url"
                  defaultValue={editingProject?.githubUrl}
                  placeholder="https://github.com/"
                />
              </label>
              <label>
                영상 링크 (선택)
                <input
                  name="videoUrl"
                  type="url"
                  defaultValue={editingProject?.videoUrl}
                  placeholder="https://youtu.be/"
                />
              </label>
              <label>
                대표 이미지 주소 (선택)
                <input
                  name="image"
                  type="url"
                  defaultValue={editingProject?.image}
                  placeholder="https://"
                />
              </label>
              <button className="button primary" disabled={busy || !connected}>
                {busy ? "저장 중…" : "프로젝트 저장"}
              </button>
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
