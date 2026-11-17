import { Icon } from "./Icon";

/** Voltar: usa o histórico do navegador; se a página foi aberta direto, vai para o início. */
export function BackButton({ onFallback, label = "Voltar" }: { onFallback: () => void; label?: string }) {
  return (
    <button
      type="button"
      className="back-button"
      onClick={() => {
        if (window.history.length > 1) window.history.back();
        else onFallback();
      }}
    >
      <span className="back-arrow"><Icon name="arrow" size={16} /></span> {label}
    </button>
  );
}
