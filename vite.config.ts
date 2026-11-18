
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { responseStoreServiceBinding } from "./cloudflare.config.ts";
import { responseStoreAdapter } from "@vinext/cloudflare/cache/response-store-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig({
  plugins: [
    {
      name: "cloudflare-db-alias",
      enforce: "pre",

      resolveId(source, importer) {
        const normalizedSource = source.replace(/\\/g, "/");
        const normalizedImporter = (importer ?? "").replace(/\\/g, "/");

        const isDatabaseImport =
          normalizedSource === "@/lib/server/db" ||
          normalizedSource.endsWith("/lib/server/db") ||
          normalizedSource.endsWith("/lib/server/db.ts") ||
          (
            normalizedSource === "./db" &&
            normalizedImporter.includes("/lib/server/")
          );

        const isMailImport =
          normalizedSource === "@/lib/server/mail" ||
          normalizedSource.endsWith("/lib/server/mail") ||
          normalizedSource.endsWith("/lib/server/mail.ts") ||
          (
            normalizedSource === "./mail" &&
            normalizedImporter.includes("/lib/server/")
          );

        if (!isDatabaseImport && !isMailImport) {
          return null;
        }

        const replacement = fileURLToPath(
          new URL(
            isDatabaseImport
              ? "./lib/server/db.cloudflare.ts"
              : "./lib/server/mail.cloudflare.ts",
            import.meta.url,
          ),
        );

        console.log("[CLOUDFLARE ALIAS] Redirecionando:", {
          source,
          importer,
          replacement,
        });

        return replacement;
      },
    },

    vinext({
      cache: responseStoreAdapter(),
      images: {
        optimizer: imagesOptimizer(),
      },
    }),

    cloudflare({
      auxiliaryWorkers: [
        {
          config: responseStoreServiceBinding,
        },
      ],

      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
