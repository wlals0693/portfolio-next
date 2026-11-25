"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
export default function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        const values = Object.fromEntries(new FormData(e.currentTarget));
        try {
          if (register) {
            const r = await fetch("/api/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });
            const b = await r.json();
            if (!r.ok) throw new Error(b.error);
            window.location.assign("/login?registered=1");
            return;
          }
          const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
          });
          if (result?.error)
            throw new Error("이메일 또는 비밀번호를 확인해주세요.");
          window.location.assign("/projects");
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {register && (
        <label>
          이름
          <input name="name" required maxLength={40} autoComplete="name" />
        </label>
      )}
      <label>
        이메일
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </label>
      <label>
        비밀번호
        <input
          name="password"
          type="password"
          required
          minLength={register ? 10 : 1}
          maxLength={72}
          autoComplete={register ? "new-password" : "current-password"}
        />
      </label>
      {register && (
        <p className="muted">
          비밀번호는 10자 이상으로 설정해주세요. 가입 후 일반 회원으로
          시작합니다.
        </p>
      )}
      <button className="button primary" disabled={busy}>
        {busy ? "처리 중…" : register ? "회원가입" : "로그인"}
      </button>
      <p className="feedback" role="status">
        {error}
      </p>
      <Link href={register ? "/login" : "/register"}>
        {register ? "이미 계정이 있나요? 로그인" : "처음 오셨나요? 회원가입"}
      </Link>
    </form>
  );
}
