import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersResponseStoreServiceBindingConfig } from "@vinext/cloudflare/cache/config";

const responseStore = await createWorkersResponseStoreServiceBindingConfig({
  worker: {
    name: "graziela-pires-confeitaria-response-store",
    compatibilityDate: "2026-11-18",
  },
  bucket: "graziela-pires-confeitaria-response-store-cache-bodies",
});

export const responseStoreServiceBinding = responseStore.serviceBindingWorker;

export default defineConfig({
  worker: defineWorker({
    ...responseStore.applicationWorker,
    name: "graziela-pires-confeitaria",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-18",
    compatibilityFlags: ["nodejs_compat"],
    observability: {
      enabled: true,
      logs: { enabled: true, headSamplingRate: 1 },
      traces: { enabled: true, headSamplingRate: 0.05 },
    },
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ...responseStore.applicationWorker.env,
      HYPERDRIVE: bindings.hyperdrive({
        id: "75d8cd767fe04a52a42fe6128b7cc701",
      }),
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      MEDIA: bindings.r2({
        name: "graziela-pires-media",
      }),
      RESEND_API_KEY: bindings.secret(),
    },
  }),
});
