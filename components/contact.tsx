"use client";
import { useState } from "react";
import { Send } from "lucide-react";
export default function Contact() {
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        setMessage("");
        try {
          const r = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          const b = await r.json();
          if (!r.ok) throw new Error(b.error);
          setMessage(b.message);
          form.reset();
          setCount(0);
        } catch (e) {
          setMessage(
            (e as Error).message || "전송하지 못했습니다. 다시 시도해주세요.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="form-row">
        <label>
          이름
          <input
            name="name"
            required
            maxLength={40}
            autoComplete="name"
            placeholder="이름 또는 닉네임"
          />
        </label>
        <label>
          이메일
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="답장을 받을 이메일"
          />
        </label>
      </div>
      <label>
        메시지
        <textarea
          name="content"
          required
          maxLength={1000}
          rows={5}
          onChange={(e) => setCount(e.target.value.length)}
          placeholder="함께 나누고 싶은 이야기를 남겨주세요."
        />
      </label>
      <div className="form-bottom">
        <span className="muted">
          {count} / 1,000 · 메시지는 공개되지 않습니다.
        </span>
        <button className="button primary" disabled={busy}>
          {busy ? "보내는 중…" : "메시지 보내기"}
          <Send size={16} />
        </button>
      </div>
      <p role="status" className="feedback">
        {message}
      </p>
    </form>
  );
}
