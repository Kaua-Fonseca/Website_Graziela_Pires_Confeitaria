import { env } from "cloudflare:workers";
import { Client, type QueryResult, type QueryResultRow } from "pg";

type CloudflareClient = Client & { release: () => void };
type CloudflareDatabase = {
  query<R extends QueryResultRow = any>(text: string, values?: any[]): Promise<QueryResult<R>>;
  connect(): Promise<CloudflareClient>;
};

async function createClient(): Promise<CloudflareClient> {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
    connectionTimeoutMillis: 10_000,
    query_timeout: 15_000,
  });

  await client.connect();

  // O Hyperdrive mantém o pool no lado da Cloudflare. Encerrar o Client
  // devolve a conexão gerenciada ao Hyperdrive.
  return Object.assign(client, {
    release: () => {
      void client.end().catch((error) => console.error("[DATABASE RELEASE]", error));
    },
  });
}

export function db(): CloudflareDatabase {
  return {
    async query<R extends QueryResultRow = any>(text: string, values?: any[]): Promise<QueryResult<R>> {
      const client = await createClient();
      try {
        return await client.query<R>(text, values);
      } finally {
        await client.end();
      }
    },
    connect: createClient,
  };
}
