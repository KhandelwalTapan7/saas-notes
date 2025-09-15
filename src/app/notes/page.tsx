// src/app/notes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { authHeaders, getJwtClaims, type JwtClaims } from '@/lib/client-auth';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
};

export default function NotesPage() {
  const [notes, setNotes]   = useState<Note[]>([]);
  const [title, setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [error, setError]   = useState('');

  const claims: JwtClaims = getJwtClaims();
  const role: string = typeof claims.role === 'string' ? claims.role : '';
  const tenantSlug: string =
    typeof claims.tenant?.slug === 'string' ? claims.tenant.slug : '';

  async function load() {
    setError('');
    const res = await fetch('/api/notes', { headers: authHeaders() });
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    if (!res.ok) {
      setError('Failed to load notes');
      return;
    }
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : data.notes ?? []);
  }

  async function createNote() {
    setError('');
    const h = authHeaders();
    h.set('Content-Type', 'application/json');
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ title, content }),
    });
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    if (!res.ok) {
      const msg = await res.text();
      setError(msg || 'Failed to create note (maybe you hit the Free plan limit?)');
      return;
    }
    setTitle('');
    setContent('');
    await load();
  }

  async function deleteNote(id: string) {
    setError('');
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      setError('Failed to delete note');
      return;
    }
    await load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-sm text-gray-500">
            Tenant: <span className="font-mono">{tenantSlug || '(unknown)'}</span> · Role:{' '}
            <span className="font-mono">{role || '(member)'}</span>
          </p>
        </div>
        <a
          className="text-blue-600 hover:underline"
          href="/login"
        >
          Logout
        </a>
      </header>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="w-full border rounded px-3 py-2"
          rows={4}
        />
        <div className="flex gap-2">
          <button
            onClick={createNote}
            className="rounded bg-black text-white px-4 py-2"
          >
            Create
          </button>
          {/* Show upgrade hint if you hit the free plan limit */}
          <a
            href={`/api/tenants/${tenantSlug}/upgrade`}
            className="rounded border px-4 py-2"
          >
            Upgrade to Pro
          </a>
        </div>
      </section>

      <section>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Title</th>
              <th className="p-2">Content</th>
              <th className="p-2 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((n) => (
              <tr key={n.id} className="border-b">
                <td className="p-2 align-top">{n.title}</td>
                <td className="p-2 align-top">{n.content}</td>
                <td className="p-2 align-top">
                  <button
                    onClick={() => deleteNote(String(n.id))}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {notes.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No notes yet. Create one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
