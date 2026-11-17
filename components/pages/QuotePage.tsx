import { useEffect, useRef, useState } from "react";
import type { GoFn } from "@/lib/types";
import { buildQuoteMessage, call, maskPhone, waUrl } from "@/lib/client";
import { slugify } from "@/lib/slug";
import { STATIC, useSite } from "@/lib/site";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

type Sent = { id?: number; url: string; message: string };

export function QuotePage({ go }: { go: GoFn }) {
  const { c, categories, user, draft, setDraft } = useSite();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const filled = useRef(false);

  // número do WhatsApp que a administradora definiu no painel (vazio = sem envio por WhatsApp)
  const hasWa = !!waUrl(c("contact.whatsapp"));

  // pré-preenche com a conta (se logada) e com o que veio do produto/showroom
  useEffect(() => {
    if (user && !filled.current) {
      filled.current = true;
      setName((n) => n || user.name);
      setWhatsapp((w) => w || maskPhone(user.phone || ""));
    }
  }, [user]);
  useEffect(() => {
    if (draft.productType) {
      const match = categories.find((x) => x.slug === slugify(draft.productType!));
      setType(match ? match.name : "Outro");
    }
    if (draft.idea) setIdea(draft.idea);
  }, [draft, categories]);

  const reset = () => { setSent(null); setDate(""); setType(""); setIdea(""); setError(""); setDraft({}); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // abre a aba agora (dentro do clique) para o navegador não bloquear; o endereço entra após salvar
    const popup = hasWa ? window.open("", "_blank") : null;
    setBusy(true);
    try {
      let id: number | undefined;
      if (!STATIC) {
        id = (await call<{ id: number }>("POST", "/api/quotes", { name, whatsapp, desiredDate: date, productType: type || undefined, idea })).id;
      }
      const message = buildQuoteMessage({ id, name, whatsapp, date, type, idea });
      const url = hasWa ? waUrl(c("contact.whatsapp"), message) : "";
      if (popup && url) popup.location.href = url;
      setSent({ id, url, message });
      setDraft({});
      window.scrollTo({ top: 0 });
    } catch (err) {
      popup?.close();
      setError(err instanceof Error && !/fetch|json/i.test(err.message) ? err.message : "Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <main className="quote-page quote-done">
        <BackButton onFallback={() => go("home")} />
        <FormMessage kind="ok">
          <strong>{sent.id ? `Pedido nº ${sent.id} registrado!` : "Mensagem pronta!"}</strong>
          <span>{sent.url ? "Abrimos o WhatsApp com a mensagem pronta. Basta tocar em enviar." : "Recebemos seu pedido e entraremos em contato pelo WhatsApp informado."}</span>
        </FormMessage>
        {sent.url && (
          <>
            <pre className="quote-preview" aria-label="Mensagem enviada">{sent.message.replace(/\*/g, "")}</pre>
            <Button href={sent.url}><Icon name="whatsapp" /> O WhatsApp não abriu? Toque aqui</Button>
          </>
        )}
        <div className="button-row">
          <Button variant="secondary" onClick={() => go("home")}>Voltar ao início</Button>
          <Button variant="ghost" onClick={reset}>Fazer outro orçamento</Button>
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
        <p>Leva menos de 2 minutos. {hasWa ? "Ao enviar, o WhatsApp abre com a mensagem do seu pedido já pronta." : "Os detalhes finais são combinados diretamente pelo WhatsApp."}</p>
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
          <Field label="Seu WhatsApp" type="tel" placeholder="(45) 99999-9999" value={whatsapp} onChange={(v) => setWhatsapp(maskPhone(v))} required autoComplete="tel" minLength={14} />
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
            <textarea placeholder="Ex.: bolo para 20 pessoas, tema floral e recheio de brigadeiro..." rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={1500} />
          </Field>
        </div>
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <div className="form-submit">
          <p>{hasWa ? "Seu pedido fica registrado e o WhatsApp abre com tudo preenchido." : "Entraremos em contato pelo WhatsApp informado."}</p>
          <Button type="submit" disabled={busy}>
            {busy ? "Enviando…" : hasWa ? <><Icon name="whatsapp" /> Enviar pelo WhatsApp</> : <>Enviar solicitação <Icon name="arrow" /></>}
          </Button>
        </div>
      </form>
    </main>
  );
}
