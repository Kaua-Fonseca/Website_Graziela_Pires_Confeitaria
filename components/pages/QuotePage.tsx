import { useEffect, useState } from "react";
import type { GoFn } from "@/lib/types";
import { call, waUrl } from "@/lib/client";
import { slugify } from "@/lib/slug";
import { useSite } from "@/lib/site";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

export function QuotePage({ go }: { go: GoFn }) {
  const { c, categories, user, draft, setDraft } = useSite();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ wa: string } | null>(null);

  // pré-preenche com a conta (se logada) e com o que veio do produto/showroom
  useEffect(() => {
    if (user) { setName((n) => n || user.name); setWhatsapp((w) => w || user.phone || ""); }
  }, [user]);
  useEffect(() => {
    if (draft.productType) {
      const match = categories.find((x) => x.slug === slugify(draft.productType!));
      setType(match ? match.name : "Outro");
    }
    if (draft.idea) setIdea(draft.idea);
  }, [draft, categories]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await call("POST", "/api/quotes", { name, whatsapp, desiredDate: date, productType: type || undefined, idea });
      const number = c("contact.whatsapp");
      const text = `Olá! Sou ${name}. Gostaria de um orçamento${type ? ` de ${type}` : ""}${date ? ` para ${date.split("-").reverse().join("/")}` : ""}.${idea ? `\n\n${idea}` : ""}`;
      setSent({ wa: number ? waUrl(number, text) : "" });
      setDraft({});
    } catch (err) {
      setError(err instanceof Error && !/fetch|json/i.test(err.message) ? err.message : "Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <main className="quote-page quote-done">
        <FormMessage kind="ok">
          <strong>Solicitação enviada!</strong>
          <span>Recebemos seu pedido e entraremos em contato pelo WhatsApp informado.</span>
        </FormMessage>
        <div className="button-row">
          {sent.wa && <Button href={sent.wa}><Icon name="whatsapp" /> Continuar no WhatsApp</Button>}
          <Button variant="secondary" onClick={() => go("home")}>Voltar ao início</Button>
        </div>
      </main>
    );
  }

  const options = [...categories.map((x) => x.name), "Outro"];
  return (
    <main className="quote-page">
      <div className="quote-intro">
        <BackButton onFallback={() => go("home")} />
        <span className="eyebrow">ORÇAMENTO RÁPIDO</span>
        <Title level={1}>Conte o<br /><em>essencial.</em></Title>
        <p>Leva menos de 2 minutos. Os detalhes finais são combinados diretamente pelo WhatsApp.</p>
        <div className="quote-points">
          <div><span>01</span><p><strong>Sem compromisso</strong>Receba uma estimativa inicial.</p></div>
          <div><span>02</span><p><strong>Atendimento humano</strong>Continue a conversa no WhatsApp.</p></div>
        </div>
      </div>
      <form className="quote-form" onSubmit={submit}>
        <div className="form-heading">
          <span>01</span>
          <div><Title level={3}>Seu pedido</Title><p>Só precisamos destas informações para começar.</p></div>
        </div>
        <div className="form-grid">
          <Field label="Nome completo" placeholder="Como podemos chamar você?" value={name} onChange={setName} required autoComplete="name" minLength={2} maxLength={120} />
          <Field label="WhatsApp" type="tel" placeholder="(45) 99999-9999" value={whatsapp} onChange={setWhatsapp} required autoComplete="tel" />
          <Field label="Data desejada" type="date" value={date} onChange={setDate} min={new Date().toISOString().slice(0, 10)} />
          <Field label="Tipo de produto">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Selecione</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-grid quote-details">
          <Field label="Conte sua ideia" full>
            <textarea placeholder="Ex.: bolo para 20 pessoas, tema floral e recheio de brigadeiro..." rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={2000} />
          </Field>
        </div>
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <div className="form-submit">
          <p>Você continuará o atendimento pelo WhatsApp.</p>
          <Button type="submit" disabled={busy}>{busy ? "Enviando…" : <>Enviar solicitação <Icon name="arrow" /></>}</Button>
        </div>
      </form>
    </main>
  );
}
