"use client";
import { useEffect, useMemo, useState } from "react";
import { CONTENT_FIELDS, SECTIONS, contentDefaults } from "@/lib/content";
import { api } from "@/components/admin/api";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Loading, PageHead, Switch, useToast } from "@/components/admin/ui";

type Site = { content: Record<string, string>; sections: Record<string, boolean> };
const DEFAULTS = contentDefaults();

export default function ContentPage() {
  const toast = useToast();
  const [site, setSite] = useState<Site | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState("");

  // o campo mostra vazio quando o valor é o padrão (o padrão aparece como dica)
  const shown = (c: Record<string, string>) => Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, c[f.key] === DEFAULTS[f.key] ? "" : c[f.key]]));

  useEffect(() => {
    api<Site>("GET", "/api/admin/content").then((s) => { setSite(s); setDraft(shown(s.content)); }).catch((e) => toast.err(e.message));
  }, []); // eslint-disable-line

  const groups = useMemo(() => {
    const m = new Map<string, typeof CONTENT_FIELDS>();
    for (const f of CONTENT_FIELDS) m.set(f.group, [...(m.get(f.group) ?? []), f]);
    return [...m];
  }, []);

  if (!site) return <><PageHead title="Conteúdo e seções" /><Loading /></>;
  const base = shown(site.content);

  async function saveGroup(group: string, fields: typeof CONTENT_FIELDS) {
    const values: Record<string, string> = {};
    for (const f of fields) if ((draft[f.key] ?? "") !== base[f.key]) values[f.key] = (draft[f.key] ?? "").trim();
    if (!Object.keys(values).length) return toast.ok("Nada para salvar");
    setSaving(group);
    try {
      const s = await api<Site>("PUT", "/api/admin/content", { values });
      setSite(s); setDraft((d) => ({ ...d, ...shown(s.content) }));
      toast.ok("Alterações salvas");
    } catch (e: any) { toast.err(e.message); } finally { setSaving(""); }
  }

  async function toggle(key: string, enabled: boolean) {
    const prev = site!;
    setSite({ ...prev, sections: { ...prev.sections, [key]: enabled } });
    try { setSite(await api<Site>("PUT", "/api/admin/sections", { sections: { [key]: enabled } })); toast.ok(enabled ? "Seção ativada" : "Seção desativada"); }
    catch (e: any) { setSite(prev); toast.err(e.message); }
  }

  const pages = [...new Set(SECTIONS.map((s) => s.page))];
  return (
    <>
      <PageHead title="Conteúdo e seções" sub="Edite os textos e escolha o que aparece no site. Campo vazio = texto padrão.">
        <a className="adm-btn ghost" href="/" target="_blank" rel="noreferrer">Ver site ↗</a>
      </PageHead>

      <section className="adm-panel">
        <h2>Seções do site</h2>
        {pages.map((p) => (
          <div key={p}>
            <h3 className="adm-sub">{p}</h3>
            <ul className="adm-switchlist">
              {SECTIONS.filter((s) => s.page === p).map((s) => (
                <li key={s.key}><span>{s.label}</span><Switch checked={site.sections[s.key]} onChange={(v) => toggle(s.key, v)} label={`${s.label}: ${site.sections[s.key] ? "ativada" : "desativada"}`} /></li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {groups.map(([group, fields]) => {
        const dirty = fields.some((f) => (draft[f.key] ?? "") !== base[f.key]);
        return (
          <section className="adm-panel" key={group}>
            <h2>{group}</h2>
            <div className="adm-form-grid">
              {fields.map((f) => f.kind === "image" ? (
                <div key={f.key} className="full"><MediaPicker label={f.label} value={draft[f.key] ?? ""} onChange={(v) => setDraft({ ...draft, [f.key]: v })} /></div>
              ) : (
                <label key={f.key} className={`adm-field ${f.kind === "textarea" ? "full" : ""}`}>
                  <span>{f.label}</span>
                  {f.kind === "textarea"
                    ? <textarea rows={3} maxLength={2000} value={draft[f.key] ?? ""} placeholder={f.default || "(vazio)"} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
                    : <input type={f.kind === "url" ? "url" : "text"} maxLength={300} value={draft[f.key] ?? ""} placeholder={f.default || "(vazio)"} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />}
                </label>
              ))}
            </div>
            <div className="adm-actions">
              <button className="adm-btn" disabled={!dirty || saving === group} onClick={() => saveGroup(group, fields)}>{saving === group ? "Salvando…" : "Salvar"}</button>
              {dirty && <span className="adm-muted">Alterações não salvas</span>}
            </div>
          </section>
        );
      })}
    </>
  );
}
