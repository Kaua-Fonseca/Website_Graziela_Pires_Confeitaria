"use client";
import { useEffect, useRef, useState } from "react";
import { api, checkFile, uploadMedia, type MediaItem } from "./api";
import { Modal, useToast } from "./ui";

/** Campo de imagem: prévia + biblioteca (com envio de nova imagem) + URL manual. */
export function MediaPicker({ value, onChange, label, allowUrl = true }: { value: string; onChange: (v: string) => void; label: string; allowUrl?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="adm-field">
      <span>{label}</span>
      <div className="adm-picker">
        <div className="adm-thumb">{value ? <img src={value} alt="" /> : <em>sem imagem</em>}</div>
        <div className="adm-picker-side">
          <div className="adm-row">
            <button type="button" className="adm-btn small" onClick={() => setOpen(true)}>Escolher da biblioteca</button>
            {value && <button type="button" className="adm-btn small ghost" onClick={() => onChange("")}>Remover</button>}
          </div>
          {allowUrl && <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="ou cole um link https://…" aria-label={`${label} (link)`} />}
        </div>
      </div>
      {open && <Library onClose={() => setOpen(false)} onPick={(u) => { onChange(u); setOpen(false); }} />}
    </div>
  );
}

function Library({ onClose, onPick }: { onClose: () => void; onPick: (url: string) => void }) {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { api<MediaItem[]>("GET", "/api/admin/media").then(setItems).catch((e) => toast.err(e.message)); }, []); // eslint-disable-line

  async function send(f?: File) {
    if (!f) return;
    const bad = checkFile(f);
    if (bad) return toast.err(bad);
    setBusy(true);
    try { const m = await uploadMedia(f); toast.ok("Imagem enviada"); onPick(m.url); }
    catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  return (
    <Modal title="Biblioteca de imagens" onClose={onClose} wide>
      <div className="adm-row" style={{ marginBottom: 14 }}>
        <button className="adm-btn" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Enviando…" : "Enviar nova imagem"}</button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { send(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {!items ? <p className="adm-muted">Carregando…</p> : items.length === 0 ? <p className="adm-muted">Nenhuma imagem ainda. Envie a primeira acima.</p> : (
        <div className="adm-media-grid compact">
          {items.map((m) => (
            <button key={m.id} className="adm-media-pick" onClick={() => onPick(m.url)} title={m.name}>
              <img src={m.url} alt={m.alt || m.name} /><span>{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
