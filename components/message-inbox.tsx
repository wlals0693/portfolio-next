"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Inbox, RefreshCw } from "lucide-react";
type Message = {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
};
type InboxData = {
  messages: Message[];
  page: number;
  total: number;
  pages: number;
};
export default function MessageInbox() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<InboxData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (session?.user?.role !== "admin") return null;
  async function load(page = 1) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/messages/inbox", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page }),
      });
      const b = await r.json();
      if (!r.ok) {
        setData(null);
        throw new Error(b.error || "메시지를 불러오지 못했습니다.");
      }
      setData(b);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="message-inbox" aria-labelledby="inbox-title">
      <div className="inbox-heading">
        <h3 id="inbox-title">
          <Inbox size={19} /> 받은 메시지
        </h3>
        <button
          className="button"
          disabled={busy}
          onClick={() => {
            if (open) {
              setOpen(false);
              setData(null);
              setError("");
            } else {
              setOpen(true);
              void load();
            }
          }}
        >
          {open ? "닫기" : "받은 메시지 보기"}
        </button>
      </div>
      {open && (
        <>
          <div className="inbox-summary">
            <span>
              {data
                ? `전체 ${data.total}개 · 최신순`
                : "메시지를 불러오는 중입니다."}
            </span>
            <button
              className="button"
              disabled={busy}
              onClick={() => load(data?.page || 1)}
            >
              <RefreshCw size={14} />
              {busy ? "불러오는 중…" : "새로고침"}
            </button>
          </div>
          {data &&
            (data.messages.length ? (
              <div className="inbox-list">
                {data.messages.map((m) => (
                  <article className="inbox-message" key={m.id}>
                    <div className="inbox-message-heading">
                      <strong>{m.name}</strong>
                      <time dateTime={m.createdAt}>
                        {new Date(m.createdAt).toLocaleString("ko-KR")}
                      </time>
                    </div>
                    <a className="inbox-email" href={`mailto:${m.email}`}>
                      {m.email}
                    </a>
                    <p>{m.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="inbox-empty">아직 받은 메시지가 없습니다.</p>
            ))}
          {data && data.pages > 1 && (
            <div className="inbox-pagination">
              <button
                className="button"
                disabled={busy || data.page <= 1}
                onClick={() => load(data.page - 1)}
              >
                이전
              </button>
              <span>
                {data.page} / {data.pages}
              </span>
              <button
                className="button"
                disabled={busy || data.page >= data.pages}
                onClick={() => load(data.page + 1)}
              >
                다음
              </button>
            </div>
          )}
          <p className="feedback" role="status">
            {error}
          </p>
        </>
      )}
    </section>
  );
}
