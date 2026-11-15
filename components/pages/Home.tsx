import type { GoFn } from "@/lib/types";
import { Categories } from "@/components/sections/Categories";
import { CompactJourney } from "@/components/sections/CompactJourney";
import { CompactShowcase } from "@/components/sections/CompactShowcase";
import { Hero } from "@/components/sections/Hero";

export function Home({ go }: { go: GoFn }) {
  return (
    <>
      <Hero go={go} />
      <Categories go={go} />
      <CompactJourney go={go} />
      <CompactShowcase go={go} />
    </>
  );
}
