import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

export function QuotePage() {
  const [sent, setSent] = useState(false);
  return (
    <main className="quote-page">
      <div className="quote-intro">
        <span className="eyebrow">ORÇAMENTO RÁPIDO</span>
        <Title level={1}>Conte o<br /><em>essencial.</em></Title>
        <p>Leva menos de 2 minutos. Os detalhes finais são combinados diretamente pelo WhatsApp.</p>
        <div className="quote-points">
          <div><span>01</span><p><strong>Sem compromisso</strong>Receba uma estimativa inicial.</p></div>
          <div><span>02</span><p><strong>Atendimento humano</strong>Continue a conversa no WhatsApp.</p></div>
        </div>
      </div>
      <form className="quote-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <div className="form-heading">
          <span>01</span>
          <div><Title level={3}>Seu pedido</Title><p>Só precisamos destas informações para começar.</p></div>
        </div>
        <div className="form-grid">
          <Field label="Nome completo" placeholder="Como podemos chamar você?" />
          <Field label="WhatsApp" placeholder="(45) 99999-9999" />
          <Field label="Data desejada" type="date" />
          <Field label="Tipo de produto">
            <select defaultValue="">
              <option value="" disabled>Selecione</option>
              <option>Naked Cake</option>
              <option>Bolo personalizado</option>
              <option>Doces</option>
              <option>Cupcakes</option>
            </select>
          </Field>
        </div>
        <div className="form-grid quote-details">
          <Field label="Conte sua ideia" full>
            <textarea placeholder="Ex.: bolo para 20 pessoas, tema floral e recheio de brigadeiro..." rows={4} />
          </Field>
        </div>
        <div className="form-submit">
          <p>Você continuará o atendimento pelo WhatsApp.</p>
          <Button type="submit"><Icon name="whatsapp" /> Continuar no WhatsApp</Button>
        </div>
        {sent && (
          <div className="success-message">
            <strong>Solicitação preparada!</strong>
            <span>Seu atendimento continuará pelo WhatsApp.</span>
          </div>
        )}
      </form>
    </main>
  );
}
