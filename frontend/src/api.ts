import type { BranchContext, Lore } from './types';

const BASE = '/api';

export async function uploadFile(file: File): Promise<{ lore: Lore; source_length: number }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function diverge(
  event_id: string,
  what_if: string
): Promise<{ branch_context: BranchContext }> {
  const res = await fetch(`${BASE}/diverge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id, what_if }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Divergence failed');
  }
  return res.json();
}

export async function chat(
  character_id: string,
  message: string,
  branch_type: 'original' | 'alternate',
  reset = false
): Promise<{ response: string; character_name: string }> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character_id, message, branch_type, reset }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Chat failed');
  }
  return res.json();
}
