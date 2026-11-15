export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <span>Graziela Pires</span>
      <small>CONFEITARIA</small>
    </div>
  );
}
