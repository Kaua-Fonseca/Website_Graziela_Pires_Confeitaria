import type { ReactNode } from "react";
import { Title } from "./Title";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  text: string;
};

export function PageHero({ eyebrow, title, text }: PageHeroProps) {
  return (
    <section className="page-hero">
      <span className="eyebrow">{eyebrow}</span>
      <Title level={1}>{title}</Title>
      <p>{text}</p>
    </section>
  );
}
