"use client";
import { useRef, useState } from "react";
import { Inbox, LockKeyhole, RefreshCw } from "lucide-react";

type Message = { id: string; name: string; email: string; content: string; createdAt: string };
type InboxData = { messages: Message[]; page: number; total: number; pages: number };
export default function MessageInbox() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<InboxData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const password = useRef("");
  function close() { setOpen(false); setData(null); setError(""); password.current = ""; }
  async function load(page = 1) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/messages/inbox", {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.current, page }),
      });
      const body = await response.json();
      if (!response.ok) { if (response.status === 401) setData(null); throw new Error(body.error || "메시지를 불러오지 못했습니다."); }
      setData(body);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="message-inbox" aria-labelledby="inbox-title">
    <div className="inbox-heading"><h3 id="inbox-title"><Inbox size={19} /> 받은 메시지</h3><button className="button" disabled={busy} onClick={() => open ? close() : setOpen(true)}>{open ? "닫기" : "받은 메시지 보기"}</button></div>
    {open && <>
      {!data ? <form className="inbox-auth" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; password.current = String(new FormData(form).get("password") || ""); form.reset(); void load(); }}>
        <label>관리자 비밀번호<input name="password" type="password" required maxLength={128} autoComplete="current-password" placeholder="관리자 비밀번호를 입력해주세요" /></label><button className="button primary" disabled={busy}><LockKeyhole size={16} />{busy ? "확인 중…" : "메시지 확인"}</button>
      </form> : <>
        <div className="inbox-summary"><span>전체 {data.total}개 · 최신순</span><button className="button" disabled={busy} onClick={() => load(data.page)}><RefreshCw size={14} />{busy ? "불러오는 중…" : "새로고침"}</button></div>
        {data.messages.length ? <div className="inbox-list">{data.messages.map(m => <article className="inbox-message" key={m.id}><div className="inbox-message-heading"><strong>{m.name}</strong><time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString("ko-KR")}</time></div><a className="inbox-email" href={`mailto:${m.email}`}>{m.email}</a><p>{m.content}</p></article>)}</div> : <p className="inbox-empty">아직 받은 메시지가 없습니다.</p>}
        {data.pages > 1 && <div className="inbox-pagination"><button className="button" disabled={busy || data.page <= 1} onClick={() => load(data.page - 1)}>이전</button><span>{data.page} / {data.pages}</span><button className="button" disabled={busy || data.page >= data.pages} onClick={() => load(data.page + 1)}>다음</button></div>}
      </>}
      <p className="feedback" role="status">{error}</p>
    </>}
  </section>;
}
