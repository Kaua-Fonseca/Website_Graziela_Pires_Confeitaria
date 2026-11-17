import type { GoFn } from "@/lib/types";
import { useSite } from "@/lib/site";
import { AboutProcess } from "@/components/sections/AboutProcess";
import { Categories } from "@/components/sections/Categories";
import { CompactJourney } from "@/components/sections/CompactJourney";
import { CompactShowcase } from "@/components/sections/CompactShowcase";
import { CustomCakes } from "@/components/sections/CustomCakes";
import { FAQ } from "@/components/sections/FAQ";
import { Hero } from "@/components/sections/Hero";
import { Instagram } from "@/components/sections/Instagram";
import { NakedFeature } from "@/components/sections/NakedFeature";
import { Sweets } from "@/components/sections/Sweets";

export function Home({ go }: { go: GoFn }) {
  const { on, ready } = useSite();
  // espera os dados do servidor para não piscar textos/seções padrão antes dos reais
  if (!ready) return <div className="loading-page" aria-busy="true" aria-label="Carregando" />;
  return (
    <>
      {on("hero") && <Hero go={go} />}
      {on("categories") && <Categories go={go} />}
      {on("journey") && <CompactJourney go={go} />}
      {on("showcase") && <CompactShowcase go={go} />}
      {on("naked") && <NakedFeature go={go} />}
      {on("custom") && <CustomCakes go={go} />}
      {on("sweets") && <Sweets go={go} />}
      {on("about") && <AboutProcess />}
      {on("faq") && <FAQ />}
      {on("instagram") && <Instagram go={go} />}
    </>
  );
}
