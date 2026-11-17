import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  children?: ReactNode;
  full?: boolean;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  min?: string;
  minLength?: number;
  maxLength?: number;
  hint?: string;
};

export function Field({ label, type = "text", placeholder, children, full = false, name, value, onChange, required, autoComplete, min, minLength, maxLength, hint }: FieldProps) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span>{label}{required ? " *" : ""}</span>
      {children || (
        <input
          type={type} name={name} placeholder={placeholder} required={required} autoComplete={autoComplete}
          min={min} minLength={minLength} maxLength={maxLength}
          value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        />
      )}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}
