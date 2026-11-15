import type { ReactNode } from "react";

type LinkProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function Link({ children, onClick, className = "" }: LinkProps) {
  return (
    <a
      href="#"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
