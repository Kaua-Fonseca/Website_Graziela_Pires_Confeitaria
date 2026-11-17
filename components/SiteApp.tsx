"use client";

import { useCallback, useEffect, useState } from "react";
import type { GoFn } from "@/lib/types";
import { parseHash, toHash, type Route } from "@/lib/router";
import { SiteProvider, useSite } from "@/lib/site";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { WhatsappFloat } from "@/components/layout/WhatsappFloat";
import { AccountPage, ForgotPage, LoginPage, RegisterPage, ResetPage } from "@/components/pages/AuthPages";
import { Catalog } from "@/components/pages/Catalog";
import { Home } from "@/components/pages/Home";
import { ProductDetail } from "@/components/pages/ProductDetail";
import { QuotePage } from "@/components/pages/QuotePage";
import { Showroom } from "@/components/pages/Showroom";

function Shell() {
  const { on } = useSite();
  const [route, setRoute] = useState<Route>({ view: "home" });
  const [token, setToken] = useState<string | undefined>();

  const apply = useCallback((r: Route) => {
    if (r.token) {
      // o token de redefinição sai da barra de endereço (histórico) assim que é lido
      setToken(r.token);
      window.history.replaceState(null, "", window.location.pathname + window.location.search + "#/redefinir");
    }
    setRoute({ ...r, token: undefined });
    requestAnimationFrame(() => {
      const el = r.anchor ? document.getElementById(r.anchor) : null;
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0 });
    });
  }, []);

  useEffect(() => {
    apply(parseHash(window.location.hash));
    const onHash = () => apply(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [apply]);

  const go: GoFn = (view, anchor, param) => {
    const h = toHash(view, anchor, param);
    if (window.location.hash === h || (h === "#/" && !window.location.hash)) apply({ view, anchor, param });
    else window.location.hash = h;
  };

  // páginas desativadas pela administradora voltam para o início
  let view = route.view;
  if ((view === "showroom" && !on("page.showroom")) || (view === "catalogo" && !on("page.catalog"))) view = "home";

  return (
    <div className="app">
      <ScrollProgress />
      <Navbar go={go} route={{ ...route, view }} />
      {view === "catalogo" && <Catalog key={route.param ?? "todos"} go={go} initial={route.param} />}
      {view === "produto" && <ProductDetail go={go} slug={route.param} />}
      {view === "showroom" && <Showroom go={go} />}
      {view === "orcamento" && <QuotePage go={go} />}
      {view === "entrar" && <LoginPage go={go} />}
      {view === "cadastro" && <RegisterPage go={go} />}
      {view === "esqueci" && <ForgotPage go={go} />}
      {view === "redefinir" && <ResetPage go={go} token={token} />}
      {view === "conta" && <AccountPage go={go} />}
      {view === "home" && <Home go={go} />}
      <Footer go={go} />
      {["home", "catalogo", "produto", "showroom"].includes(view) && <WhatsappFloat go={go} />}
    </div>
  );
}

export function SiteApp() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  );
}
