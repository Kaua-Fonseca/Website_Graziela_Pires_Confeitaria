"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/* ---------- Toasts ---------- */
type Toast = { id: number; kind: "ok" | "err"; text: string };
const ToastCtx = createContext<{ ok: (t: string) => void; err: (t: string) => void }>({ ok() {}, err() {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const n = useRef(0);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++n.current;
    setItems((x) => [...x, { id, kind, text }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), kind === "err" ? 6000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={{ ok: (t) => push("ok", t), err: (t) => push("err", t) }}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`adm-toast ${t.kind}`}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Modal e confirmação ---------- */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="adm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`adm-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><button className="adm-icon" onClick={onClose} aria-label="Fechar">✕</button></header>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ title, message, confirmLabel = "Excluir", typeToConfirm, busy, onConfirm, onCancel }: {
  title: string; message: ReactNode; confirmLabel?: string; typeToConfirm?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const blocked = !!typeToConfirm && typed !== typeToConfirm;
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="adm-muted">{message}</p>
      {typeToConfirm && (
        <label className="adm-field">
          <span>Digite <b>{typeToConfirm}</b> para confirmar</span>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
        </label>
      )}
      <div className="adm-actions">
        <button className="adm-btn ghost" onClick={onCancel}>Cancelar</button>
        <button className="adm-btn danger" disabled={blocked || busy} onClick={onConfirm}>{busy ? "Aguarde…" : confirmLabel}</button>
      </div>
    </Modal>
  );
}

export const Loading = () => <p className="adm-muted adm-loading">Carregando…</p>;

let adminNavs = 0;
export const markAdminNav = () => { adminNavs++; };

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="adm-pagehead">
      <div><AdminBack /><h1>{title}</h1>{sub && <p className="adm-muted">{sub}</p>}</div>
      {children && <div className="adm-pagehead-actions">{children}</div>}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`adm-switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}><i /></button>
  );
}

/** Voltar para a tela anterior do painel; se não houver, para o dashboard. Não aparece no dashboard. */
function AdminBack() {
  const path = usePathname();
  const router = useRouter();
  if (path === "/admin") return null;
  return (
    <button type="button" className="adm-back-btn" onClick={() => (adminNavs > 1 ? router.back() : router.push("/admin"))}>
      ← Voltar
    </button>
  );
}
