import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  children?: ReactNode;
  full?: boolean;
};

export function Field({ label, type = "text", placeholder, children, full = false }: FieldProps) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span>{label}</span>
      {children || <input type={type} placeholder={placeholder} />}
    </label>
  );
}
