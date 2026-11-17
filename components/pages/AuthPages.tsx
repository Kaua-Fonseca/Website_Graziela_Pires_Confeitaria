import { useEffect, useState } from "react";
import type { GoFn, User } from "@/lib/types";
import { call } from "@/lib/client";
import { STATIC, useSite } from "@/lib/site";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { Link } from "@/components/ui/Link";
import { Title } from "@/components/ui/Title";

function Shell({ title, sub, go, children }: { title: string; sub?: string; go: GoFn; children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <BackButton onFallback={() => go("home")} />
      <div className="auth-card">
        <Title level={2}>{title}</Title>
        {sub && <p className="auth-sub">{sub}</p>}
        {STATIC ? <FormMessage kind="error">Contas de cliente não estão disponíveis nesta versão do site.</FormMessage> : children}
      </div>
    </main>
  );
}

const errMsg = (e: unknown) => (e instanceof Error && !/fetch|json/i.test(e.message) ? e.message : "Não foi possível concluir. Tente novamente.");

export function LoginPage({ go }: { go: GoFn }) {
  const { setUser } = useSite();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const u = await call<User>("POST", "/api/auth/login", { email, password });
      setUser(u);
      go(u.role === "ADMIN" ? "conta" : "home");
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Entrar" sub="Acesse sua conta para acompanhar seus dados e agilizar seus pedidos." go={go}>
      <form onSubmit={submit} className="auth-form">
        <Field label="E-mail" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <Field label="Senha" type="password" value={password} onChange={setPassword} required autoComplete="current-password" />
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <Button type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
      </form>
      <div className="auth-links">
        <Link onClick={() => go("esqueci")}>Esqueci minha senha</Link>
        <Link onClick={() => go("cadastro")}>Criar uma conta</Link>
      </div>
    </Shell>
  );
}

export function RegisterPage({ go }: { go: GoFn }) {
  const { setUser } = useSite();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setError("As senhas não conferem");
    setBusy(true); setError("");
    try {
      setUser(await call<User>("POST", "/api/auth/register", { name: f.name, email: f.email, phone: f.phone, password: f.password }));
      go("conta");
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Criar conta" sub="Leva menos de um minuto." go={go}>
      <form onSubmit={submit} className="auth-form">
        <Field label="Nome completo" value={f.name} onChange={set("name")} required autoComplete="name" minLength={2} />
        <Field label="E-mail" type="email" value={f.email} onChange={set("email")} required autoComplete="email" />
        <Field label="WhatsApp (opcional)" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
        <Field label="Senha" type="password" value={f.password} onChange={set("password")} required minLength={10} autoComplete="new-password" hint="Mínimo de 10 caracteres." />
        <Field label="Repita a senha" type="password" value={f.confirm} onChange={set("confirm")} required autoComplete="new-password" />
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <Button type="submit" disabled={busy}>{busy ? "Criando…" : "Criar conta"}</Button>
      </form>
      <div className="auth-links"><Link onClick={() => go("entrar")}>Já tenho conta</Link></div>
    </Shell>
  );
}

export function ForgotPage({ go }: { go: GoFn }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { setMsg((await call<{ message: string }>("POST", "/api/auth/forgot", { email })).message); }
    catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Recuperar senha" sub="Informe o e-mail da sua conta para receber o link de redefinição." go={go}>
      {msg ? <FormMessage kind="ok">{msg}</FormMessage> : (
        <form onSubmit={submit} className="auth-form">
          <Field label="E-mail" type="email" value={email} onChange={setEmail} required autoComplete="email" />
          {error && <FormMessage kind="error">{error}</FormMessage>}
          <Button type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar link"}</Button>
        </form>
      )}
      <div className="auth-links"><Link onClick={() => go("entrar")}>Voltar ao login</Link></div>
    </Shell>
  );
}

export function ResetPage({ go, token }: { go: GoFn; token?: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("As senhas não conferem");
    setBusy(true); setError("");
    try { await call("POST", "/api/auth/reset", { token, password }); setDone(true); }
    catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Nova senha" go={go}>
      {!token ? <FormMessage kind="error">Link inválido. Peça uma nova redefinição de senha.</FormMessage>
        : done ? <FormMessage kind="ok">Senha alterada! Já pode entrar com a nova senha.</FormMessage>
        : (
          <form onSubmit={submit} className="auth-form">
            <Field label="Nova senha" type="password" value={password} onChange={setPassword} required minLength={10} autoComplete="new-password" hint="Mínimo de 10 caracteres." />
            <Field label="Repita a nova senha" type="password" value={confirm} onChange={setConfirm} required autoComplete="new-password" />
            {error && <FormMessage kind="error">{error}</FormMessage>}
            <Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar nova senha"}</Button>
          </form>
        )}
      <div className="auth-links">
        <Link onClick={() => go(done ? "entrar" : "esqueci")}>{done ? "Ir para o login" : "Pedir novo link"}</Link>
      </div>
    </Shell>
  );
}

export function AccountPage({ go }: { go: GoFn }) {
  const { user, setUser } = useSite();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => { if (user) { setName(user.name); setPhone(user.phone ?? ""); } }, [user]);
  if (!user) return <main className="auth-page"><div className="auth-card"><p>Carregando…</p></div></main>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    try { setUser(await call<User>("PATCH", "/api/account", { name, phone })); setMsg({ kind: "ok", text: "Dados salvos." }); }
    catch (err) { setMsg({ kind: "error", text: errMsg(err) }); }
  };
  const changePw = async (e: React.FormEvent) => {
    e.preventDefault(); setPwMsg(null);
    if (pw.next !== pw.confirm) return setPwMsg({ kind: "error", text: "As senhas não conferem" });
    try {
      await call("PUT", "/api/account/password", { current: pw.current, password: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ kind: "ok", text: "Senha alterada. Outros dispositivos foram desconectados." });
    } catch (err) { setPwMsg({ kind: "error", text: errMsg(err) }); }
  };
  const logout = async () => { try { await call("POST", "/api/auth/logout"); } catch {} setUser(null); go("home"); };

  return (
    <main className="auth-page">
      <BackButton onFallback={() => go("home")} />
      <div className="auth-card">
        <Title level={2}>Minha conta</Title>
        <p className="auth-sub">{user.email}{user.role === "ADMIN" ? " · Administradora" : ""}</p>
        {user.role === "ADMIN" && <Button variant="secondary" href="/admin">Abrir painel administrativo</Button>}
        <form onSubmit={save} className="auth-form">
          <Field label="Nome" value={name} onChange={setName} required minLength={2} autoComplete="name" />
          <Field label="WhatsApp" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
          {msg && <FormMessage kind={msg.kind}>{msg.text}</FormMessage>}
          <Button type="submit">Salvar dados</Button>
        </form>
        <form onSubmit={changePw} className="auth-form">
          <Title level={3}>Alterar senha</Title>
          <Field label="Senha atual" type="password" value={pw.current} onChange={(v) => setPw((s) => ({ ...s, current: v }))} required autoComplete="current-password" />
          <Field label="Nova senha" type="password" value={pw.next} onChange={(v) => setPw((s) => ({ ...s, next: v }))} required minLength={10} autoComplete="new-password" hint="Mínimo de 10 caracteres." />
          <Field label="Repita a nova senha" type="password" value={pw.confirm} onChange={(v) => setPw((s) => ({ ...s, confirm: v }))} required autoComplete="new-password" />
          {pwMsg && <FormMessage kind={pwMsg.kind}>{pwMsg.text}</FormMessage>}
          <Button type="submit" variant="secondary">Alterar senha</Button>
        </form>
        <Button variant="ghost" onClick={logout}>Sair da conta</Button>
      </div>
    </main>
  );
}
