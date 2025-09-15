"use client";

import { useEffect, useState } from "react";
import { authHeaders, clearToken, getJwtClaims } from "@/lib/client-auth";

type Note = { id: string; title: string; content: string; createdAt: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const claims = getJwtClaims();
  const role: string = claims?.role || "";
  const tenantSlug: string = claims?.tenant?.slug || "";

  async function load() {
    const res = await fetch("/api/notes", { headers: authHeaders() });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    setNotes(await res.json());
  }

  async function addNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ title, content }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 403 && /Upgrade/i.test(d?.error || "")) {
        setInfo("Free plan limit reached. If ADMIN, upgrade below.");
      } else {
        setError(d?.error || "Error creating note");
      }
      return;
    }
    setTitle("");
    setContent("");
    load();
  }

  async function del(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE", headers: authHeaders() });
    load();
  }

  async function upgrade() {
    const res = await fetch(`/api/tenants/${tenantSlug}/upgrade`, {
      method: "POST",
      headers: authHeaders(),
    });
    const d = await res.json();
    if (res.ok) setInfo(`Upgraded to ${d.plan}. Try again.`);
    else setError(d?.error || "Upgrade failed");
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 760, margin: "32px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Notes</h1>
        <button onClick={() => { clearToken(); window.location.href = "/login"; }}>
          Logout
        </button>
      </header>

      <section style={{ border: "1px solid #ddd", padding: 12, margin: "16px 0" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", padding: 8, height: 100 }}
        />
        <button onClick={addNote}>Add Note</button>
      </section>

      {role === "ADMIN" && info.includes("Free plan") && (
        <section style={{ border: "1px dashed #999", padding: 12 }}>
          <p>{info}</p>
          <button onClick={upgrade}>Upgrade to Pro</button>
        </section>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul>
        {notes.map((n) => (
          <li key={n.id} style={{ borderBottom: "1px solid #eee", padding: 8 }}>
            <strong>{n.title}</strong>
            <button onClick={() => del(n.id)} style={{ marginLeft: 8 }}>
              Delete
            </button>
            <p>{n.content}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
