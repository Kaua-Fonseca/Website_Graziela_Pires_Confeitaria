"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, checkFile, fmtDate, uploadMedia, type MediaItem } from "@/components/admin/api";
import { Confirm, Loading, Modal, PageHead, useToast } from "@/components/admin/ui";

const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function ImagesPage() {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [staged, setStaged] = useState<{ file: File; preview: string; replace?: MediaItem } | null>(null);
  const [del, setDel] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState<MediaItem | null>(null);
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const newInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<MediaItem | null>(null);

  const load = useCallback(() => api<MediaItem[]>("GET", "/api/admin/media").then(setItems).catch((e) => toast.err(e.message)), []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  useEffect(() => () => { if (staged) URL.revokeObjectURL(staged.preview); }, [staged]);

  function stage(file: File | undefined, replace?: MediaItem) {
    if (!file) return;
    const bad = checkFile(file);
    if (bad) return toast.err(bad);
    setStaged({ file, preview: URL.createObjectURL(file), replace });
  }
  async function send() {
    if (!staged) return;
    setBusy(true);
    try { await uploadMedia(staged.file, staged.replace?.id); toast.ok(staged.replace ? "Imagem substituída" : "Imagem enviada"); setStaged(null); load(); }
    catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!del) return;
    setBusy(true);
    try { await api("DELETE", `/api/admin/media/${del.id}`); toast.ok("Imagem excluída"); setDel(null); load(); }
    catch (e: any) { toast.err(e.message); setDel(null); } finally { setBusy(false); }
  }
  async function saveAlt() {
    if (!alt) return;
    setBusy(true);
    try { await api("PATCH", `/api/admin/media/${alt.id}`, { alt: altText }); toast.ok("Texto alternativo salvo"); setAlt(null); load(); }
    catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHead title="Imagens" sub="JPG, PNG ou WebP de até 5 MB. Ao substituir, o site inteiro passa a usar a nova foto.">
        <button className="adm-btn" onClick={() => newInput.current?.click()}>+ Enviar imagem</button>
      </PageHead>
      <input ref={newInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { stage(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={replaceInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { stage(e.target.files?.[0], replaceTarget.current ?? undefined); e.target.value = ""; }} />

      {!items ? <Loading /> : items.length === 0 ? <p className="adm-empty">Nenhuma imagem enviada ainda.</p> : (
        <div className="adm-media-grid">
          {items.map((m) => (
            <figure key={m.id} className="adm-media">
              <img src={`${m.url}?v=${encodeURIComponent(m.createdAt)}-${m.size}`} alt={m.alt || m.name} loading="lazy" />
              <figcaption>
                <strong title={m.name}>{m.name}</strong>
                <small className="adm-muted">{kb(m.size)} · {fmtDate(m.createdAt)}</small>
                <small className="adm-muted">{m.alt ? `Alt: ${m.alt}` : "Sem texto alternativo"}</small>
                <div className="adm-row">
                  <button className="adm-btn small" onClick={() => { replaceTarget.current = m; replaceInput.current?.click(); }}>Substituir</button>
                  <button className="adm-btn small ghost" onClick={() => { setAlt(m); setAltText(m.alt); }}>Texto alt.</button>
                  <button className="adm-btn small danger-ghost" onClick={() => setDel(m)}>Excluir</button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {staged && (
        <Modal title={staged.replace ? `Substituir “${staged.replace.name}”` : "Enviar nova imagem"} onClose={() => setStaged(null)}>
          <p className="adm-muted">Confira a prévia antes de salvar.</p>
          <div className="adm-preview"><img src={staged.preview} alt="Prévia" /></div>
          <p className="adm-muted">{staged.file.name} · {kb(staged.file.size)}</p>
          <div className="adm-actions"><button className="adm-btn ghost" onClick={() => setStaged(null)}>Cancelar</button><button className="adm-btn" disabled={busy} onClick={send}>{busy ? "Enviando…" : staged.replace ? "Substituir" : "Enviar"}</button></div>
        </Modal>
      )}
      {alt && (
        <Modal title="Texto alternativo" onClose={() => setAlt(null)}>
          <label className="adm-field"><span>Descreva a imagem (ajuda leitores de tela e o Google)</span><input value={altText} maxLength={200} onChange={(e) => setAltText(e.target.value)} autoFocus /></label>
          <div className="adm-actions"><button className="adm-btn ghost" onClick={() => setAlt(null)}>Cancelar</button><button className="adm-btn" disabled={busy} onClick={saveAlt}>Salvar</button></div>
        </Modal>
      )}
      {del && <Confirm title="Excluir imagem?" busy={busy} onCancel={() => setDel(null)} onConfirm={remove} message={<>“{del.name}” será apagada. Se estiver em uso no site, o sistema vai impedir a exclusão.</>} />}
    </>
  );
}
