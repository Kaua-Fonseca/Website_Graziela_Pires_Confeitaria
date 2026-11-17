import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  /** Link externo (abre em nova aba). */
  href?: string;
  label?: string;
};

export function Button({ children, variant = "primary", onClick, disabled, type = "button", className = "", href, label }: ButtonProps) {
  const cls = `button button-${variant} ${className}`;
  if (href) {
    return <a className={cls} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>{children}</a>;
  }
  return <button className={cls} onClick={onClick} disabled={disabled} type={type} aria-label={label}>{children}</button>;
}
