import type { ReactNode } from "react";
import { Title } from "./Title";

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, text, align = "left" }: SectionHeaderProps) {
  return (
    <div className={`section-header ${align === "center" ? "center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <Title>{title}</Title>
      {text && <p>{text}</p>}
    </div>
  );
}
