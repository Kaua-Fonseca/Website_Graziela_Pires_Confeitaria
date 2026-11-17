import type { ReactNode } from "react";

type LinkProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  current?: boolean;
};

export function Link({ children, onClick, className = "", current }: LinkProps) {
  return (
    <a
      href="#"
      className={`${className} ${current ? "active" : ""}`.trim()}
      aria-current={current ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
