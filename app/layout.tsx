import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Graziela Pires Confeitaria | Bolos e doces artesanais",
  description: "Bolos e doces personalizados, feitos à mão para celebrar momentos especiais em Foz do Iguaçu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
