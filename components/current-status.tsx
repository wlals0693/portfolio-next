"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Check, Circle } from "lucide-react";
import type { CurrentStatus } from "@/lib/current-status";
export default function CurrentProgress({
  initial,
}: {
  initial: CurrentStatus;
}) {
  const { data: session } = useSession();
  const [data, setData] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="progress-card">
      <div className="section-heading">
        <h2 id="development-status">현재 개발 진행 상태</h2>
        {session?.user?.role === "admin" && (
          <button
            className="button"
            onClick={() => {
              setDraft(structuredClone(data));
              setEditing(!editing);
              setError("");
            }}
          >
            {editing ? "취소" : "진행 상태 수정"}
          </button>
        )}
      </div>
      {editing ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const r = await fetch("/api/current", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
              });
              const b = await r.json();
              if (!r.ok) throw new Error(b.error);
              setData(b);
              setEditing(false);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            현재 상태 요약
            <textarea
              required
              maxLength={500}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            />
          </label>
          {draft.milestones.map((m, i) => (
            <div className="status-edit-row" key={i}>
              <label>
                단계 {i + 1}
                <input
                  required
                  maxLength={150}
                  value={m.title}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      milestones: draft.milestones.map((s, n) =>
                        n === i ? { ...s, title: e.target.value } : s,
                      ),
                    })
                  }
                />
              </label>
              <label>
                상태
                <select
                  value={m.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      milestones: draft.milestones.map((s, n) =>
                        n === i ? { ...s, status: e.target.value } : s,
                      ),
                    })
                  }
                >
                  {["완료", "진행 과제", "예정"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
          ))}
          <button className="button primary" disabled={busy}>
            {busy ? "저장 중…" : "변경사항 저장"}
          </button>
        </form>
      ) : (
        <>
          <p className="status-summary">{data.summary}</p>
          <ol className="milestone-list">
            {data.milestones.map((step, i) => (
              <li
                key={i}
                className={
                  step.status === "완료" ? "milestone completed" : "milestone"
                }
              >
                <span className="milestone-icon" aria-hidden="true">
                  {step.status === "완료" ? (
                    <Check size={17} />
                  ) : (
                    <Circle size={15} />
                  )}
                </span>
                <span className="milestone-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="milestone-title">{step.title}</span>
                <span
                  className={`milestone-status ${step.status === "예정" ? "planned" : ""}`}
                >
                  {step.status}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="feedback" role="status">
        {error}
      </p>
      <p className="validation-note">
        초기 실행 검증은 모델이 실행되는지 확인한 단계이며, 실제 의류
        데이터에서의 추천 품질이나 전체 서비스 완성을 의미하지 않습니다.
      </p>
    </div>
  );
}
