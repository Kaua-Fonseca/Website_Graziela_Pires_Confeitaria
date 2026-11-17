export function FormMessage({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  return <div className={kind === "ok" ? "success-message" : "error-message"} role={kind === "ok" ? "status" : "alert"}>{children}</div>;
}
