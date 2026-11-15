import type { ReactNode } from "react";

type TitleProps = {
  children: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
};

export function Title({ children, level = 2, className = "" }: TitleProps) {
  return (
    <div role="heading" aria-level={level} className={`title title-${level} ${className}`}>
      {children}
    </div>
  );
}
