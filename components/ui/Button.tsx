import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export function Button({ children, variant = "primary", onClick, disabled, type = "button", className = "" }: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
