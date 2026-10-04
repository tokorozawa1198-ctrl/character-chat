"use client";

// 떡존이 영구 메모리 관리 UI.
// admin 모드에서만 마운트됨. 첫 진입 시 사용자가 MEMORY_ADMIN_TOKEN을 한 번 입력하면
// localStorage에 보관해 다음부턴 자동.

import { useCallback, useEffect, useRef, useState } from "react";

type MemoryKind =
  | "promise"
  | "affection"
  | "boundary"
  | "jealousy"
  | "story"
  | "emotion";

type MemoryRow = {
  id: string;
  text: string;
  kind: MemoryKind | null;
  chapter: number | null;
  source: "auto" | "manual";
  created_at: string;
};

const ADMIN_TOKEN_KEY = "ddeokjon_memory_admin_token";

const KIND_OPTIONS: { value: MemoryKind | ""; label: string }[] = [
  { value: "", label: "분류 없음" },
  { value: "story", label: "사건 (story)" },
  { value: "promise", label: "약속 (promise)" },
  { value: "affection", label: "애정 (affection)" },
  { value: "boundary", label: "거리 (boundary)" },
  { value: "jealousy", label: "질투 (jealousy)" },
  { value: "emotion", label: "감정 (emotion)" },
];

function loadToken(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; } catch { return ""; }
}
function saveToken(t: string) {
  try { localStorage.setItem(ADMIN_TOKEN_KEY, t); } catch {}
}
function clearToken() {
  try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch {}
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return iso.slice(0, 16); }
}

export function MemoryAdminPanel() {
  const [token, setToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [memories, setMemories] = useState<MemoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  // 새 메모리 입력 폼
  const [newText, setNewText] = useState("");
  const [newKind, setNewKind] = useState<MemoryKind | "">("");

  const inFlight = useRef(false);

  useEffect(() => {
    const stored = loadToken();
    if (stored) setToken(stored);
  }, []);

  const fetchList = useCallback(async (t: string) => {
    if (!t || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/memory/list?limit=30", {
        method: "GET",
        headers: { "x-memory-token": t },
        cache: "no-store",
      });
      if (res.status === 401) {
        setError("토큰이 잘못됐습니다. 다시 입력해주세요.");
        clearToken();
        setToken("");
        return;
      }
      if (!res.ok) {
        setError(`서버 오류: ${res.status}`);
        return;
      }
      const data = await res.json();
      setMemories(Array.isArray(data?.memories) ? data.memories : []);
    } catch (e: any) {
      setError(`네트워크 오류: ${e?.message || e}`);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchList(token);
  }, [token, fetchList]);

  const handleTokenSubmit = () => {
    const t = tokenInput.trim();
    if (!t) return;
    saveToken(t);
    setToken(t);
    setTokenInput("");
  };

  const handleResetToken = () => {
    clearToken();
    setToken("");
    setMemories([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 기억을 삭제할까요? 되돌릴 수 없음.")) return;
    try {
      const res = await fetch(`/api/memory/${id}`, {
        method: "DELETE",
        headers: { "x-memory-token": token },
      });
      if (!res.ok) {
        setError("삭제 실패");
        return;
      }
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      setError(`삭제 오류: ${e?.message || e}`);
    }
  };

  const handleStartEdit = (m: MemoryRow) => {
    setEditingId(m.id);
    setEditText(m.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/memory/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-memory-token": token },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        setError("수정 실패");
        return;
      }
      const data = await res.json();
      const updated = data?.memory as MemoryRow;
      setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setEditingId(null);
      setEditText("");
    } catch (e: any) {
      setError(`수정 오류: ${e?.message || e}`);
    }
  };

  const handleAddManual = async () => {
    const text = newText.trim();
    if (!text) return;
    try {
      const res = await fetch("/api/memory/list", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-memory-token": token },
        body: JSON.stringify({ text, kind: newKind || null }),
      });
      if (!res.ok) {
        setError("추가 실패");
        return;
      }
      const data = await res.json();
      const inserted = data?.memory as MemoryRow;
      setMemories((prev) => [inserted, ...prev]);
      setNewText("");
      setNewKind("");
    } catch (e: any) {
      setError(`추가 오류: ${e?.message || e}`);
    }
  };

  // 토큰 미입력 상태
  if (!token) {
    return (
      <div className="memoryAdmin">
        <p className="memoryAdminHint">
          떡존이 메모리 관리에 들어가려면 <code>MEMORY_ADMIN_TOKEN</code> 값을 한 번만 입력하세요.
          이 브라우저에 저장됩니다.
        </p>
        <div className="memoryAdminTokenRow">
          <input
            type="password"
            placeholder="토큰 붙여넣기"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleTokenSubmit(); }}
            className="memoryAdminInput"
          />
          <button className="memoryAdminBtn primary" onClick={handleTokenSubmit}>저장</button>
        </div>
      </div>
    );
  }

  return (
    <div className="memoryAdmin">
      <div className="memoryAdminToolbar">
        <button className="memoryAdminBtn" onClick={() => fetchList(token)} disabled={loading}>
          {loading ? "불러오는 중..." : "🔄 새로고침"}
        </button>
        <button className="memoryAdminBtn ghost" onClick={handleResetToken}>토큰 재설정</button>
        <span className="memoryAdminCount">{memories.length}개</span>
      </div>

      {error && <div className="memoryAdminError">{error}</div>}

      <div className="memoryAdminAddForm">
        <textarea
          className="memoryAdminTextarea"
          placeholder="수동 추가할 기억 (예: 주인님과 새벽 4시에 부엌에서 키스했다)"
          rows={2}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <div className="memoryAdminAddRow">
          <select
            className="memoryAdminInput"
            value={newKind}
            onChange={(e) => setNewKind(e.target.value as MemoryKind | "")}
          >
            {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="memoryAdminBtn primary" onClick={handleAddManual} disabled={!newText.trim()}>
            ➕ 추가
          </button>
        </div>
      </div>

      <ul className="memoryList">
        {memories.length === 0 && !loading && (
          <li className="memoryEmpty">아직 저장된 기억이 없음. 채팅 10턴 쌓이면 자동으로 들어옵니다.</li>
        )}
        {memories.map((m) => (
          <li key={m.id} className="memoryItem">
            <div className="memoryItemMeta">
              <span className={`memoryBadge ${m.source === "manual" ? "manual" : "auto"}`}>
                {m.source === "manual" ? "수동" : "자동"}
              </span>
              {m.kind && <span className="memoryBadge kind">{m.kind}</span>}
              <span className="memoryDate">{formatDate(m.created_at)}</span>
            </div>
            {editingId === m.id ? (
              <div className="memoryEditRow">
                <textarea
                  className="memoryAdminTextarea"
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="memoryAdminAddRow">
                  <button className="memoryAdminBtn primary" onClick={handleSaveEdit}>저장</button>
                  <button className="memoryAdminBtn ghost" onClick={handleCancelEdit}>취소</button>
                </div>
              </div>
            ) : (
              <>
                <p className="memoryItemText">{m.text}</p>
                <div className="memoryItemActions">
                  <button className="memoryAdminBtn small" onClick={() => handleStartEdit(m)}>수정</button>
                  <button className="memoryAdminBtn small danger" onClick={() => handleDelete(m.id)}>삭제</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
