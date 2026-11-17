import type { GoFn } from "@/lib/types";
import { waUrl } from "@/lib/client";
import { useSite } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function WhatsappFloat({ go }: { go: GoFn }) {
  const { c } = useSite();
  const wa = c("contact.whatsapp") ? waUrl(c("contact.whatsapp"), "Olá! Gostaria de fazer um orçamento.") : "";
  const inner = <><Icon name="whatsapp" size={24} /><span>Fale conosco</span></>;
  return wa
    ? <Button className="whatsapp-float" href={wa}>{inner}</Button>
    : <Button className="whatsapp-float" onClick={() => go("orcamento")}>{inner}</Button>;
}
