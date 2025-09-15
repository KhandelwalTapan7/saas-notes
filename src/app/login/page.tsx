"use client";

import { useState } from "react";
import { saveToken } from "@/lib/client-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@acme.test");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Login failed");
      return;
    }

    saveToken(data.token);
    window.location.href = "/notes";
  }

  return (
    <main style={{ maxWidth: 440, margin: "64px auto", padding: 24 }}>
      <h1>Login</h1>
      <p style={{ fontSize: 12, marginBottom: 16 }}>
        Accounts: admin@acme.test, user@acme.test, admin@globex.test, user@globex.test
        <br />
        Password for all: <code>password</code>
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8 }}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
