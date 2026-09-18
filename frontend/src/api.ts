import type { BranchContext, Lore } from "./types";

const BASE = "/api";
const SESSION_KEY = "p11_session_id";

function sessionHeaders(): HeadersInit {
  const sessionId = localStorage.getItem(SESSION_KEY);
  return sessionId ? { "X-Session-ID": sessionId } : {};
}

export async function uploadFile(
  file: File,
): Promise<{
  lore: Lore;
  source_length: number;
  session_id: string;
  warning?: string;
}> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: form,
    headers: sessionHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload failed");
  }
  const result = await res.json();
  localStorage.setItem(SESSION_KEY, result.session_id);
  return result;
}

export async function diverge(
  event_id: string,
  what_if: string,
): Promise<{ branch_context: BranchContext }> {
  const res = await fetch(`${BASE}/diverge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders() },
    body: JSON.stringify({ event_id, what_if }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Divergence failed");
  }
  return res.json();
}

export async function chat(
  character_id: string,
  message: string,
  branch_type: "original" | "alternate",
  reset = false,
): Promise<{ response: string; character_name: string }> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders() },
    body: JSON.stringify({ character_id, message, branch_type, reset }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Chat failed");
  }
  return res.json();
}
