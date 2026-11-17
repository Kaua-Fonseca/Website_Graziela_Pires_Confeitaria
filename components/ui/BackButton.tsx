import { canGoBack } from "@/lib/router";
import { Icon } from "./Icon";

/** Voltar: usa o histórico do navegador se a página anterior for deste site; senão vai para a tela de reserva. */
export function BackButton({ onFallback, label = "Voltar" }: { onFallback: () => void; label?: string }) {
  return (
    <button
      type="button"
      className="back-button"
      onClick={() => {
        if (canGoBack()) window.history.back();
        else onFallback();
      }}
    >
      <span className="back-arrow"><Icon name="arrow" size={16} /></span> {label}
    </button>
  );
}
