"use client";

import { useMemo, useState } from "react";
import type { GoFn, View } from "@/lib/types";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { WhatsappFloat } from "@/components/layout/WhatsappFloat";
import { Catalog } from "@/components/pages/Catalog";
import { Home } from "@/components/pages/Home";
import { ProductDetail } from "@/components/pages/ProductDetail";
import { QuotePage } from "@/components/pages/QuotePage";
import { Showroom } from "@/components/pages/Showroom";

export function SiteApp() {
  const [view, setView] = useState<View>("home");

  const go: GoFn = (next, anchor) => {
    setView(next);
    requestAnimationFrame(() => {
      if (anchor && next === "home") document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const content = useMemo(() => {
    if (view === "catalogo") return <Catalog go={go} />;
    if (view === "produto") return <ProductDetail go={go} />;
    if (view === "showroom") return <Showroom />;
    if (view === "orcamento") return <QuotePage />;
    return <Home go={go} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return (
    <div className="app">
      <ScrollProgress />
      <Navbar go={go} />
      {content}
      <Footer go={go} />
      <WhatsappFloat go={go} />
    </div>
  );
}
