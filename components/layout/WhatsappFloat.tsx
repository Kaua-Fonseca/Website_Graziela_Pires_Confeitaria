import type { GoFn } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function WhatsappFloat({ go }: { go: GoFn }) {
  return (
    <Button className="whatsapp-float" onClick={() => go("orcamento")}>
      <Icon name="whatsapp" size={24} />
      <span>Fale conosco</span>
    </Button>
  );
}
