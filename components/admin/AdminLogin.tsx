"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string; role?: string };
      if (!res.ok) { setError(data.error ?? "Não foi possível entrar."); return; }
      if (data.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" });
        setError("Esta conta não tem acesso ao painel.");
        return;
      }
      router.refresh();
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setBusy(false); }
  }

  return (
    <main className="adm-login">
      <form onSubmit={submit} className="adm-login-card">
        <span className="adm-eyebrow">PAINEL ADMINISTRATIVO</span>
        <h1>Graziela Pires</h1>
        <p className="adm-muted">Entre com sua conta de administrador.</p>
        <label className="adm-field"><span>E-mail</span><input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
        <label className="adm-field"><span>Senha</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <div className="adm-alert" role="alert">{error}</div>}
        <button className="adm-btn block" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        <Link href="/" className="adm-back">← Voltar ao site</Link>
      </form>
    </main>
  );
}
