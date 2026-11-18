
import { env } from "cloudflare:workers";
import {
  Client,
  type QueryResult,
  type QueryResultRow,
} from "pg";

type CloudflareClient = Client & {
  release: () => void;
};

type CloudflareDatabase = {
  query<R extends QueryResultRow = any>(
    text: string,
    values?: any[],
  ): Promise<QueryResult<R>>;

  connect(): Promise<CloudflareClient>;
};

async function createClient(): Promise<CloudflareClient> {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
  });

  await client.connect();

  // Compatibilidade com o padrão Pool do node-postgres.
  // O Hyperdrive gerencia o pool de conexões.
  return Object.assign(client, {
    release: () => {},
  });
}

export function db(): CloudflareDatabase {
  return {
    async query<R extends QueryResultRow = any>(
      text: string,
      values?: any[],
    ): Promise<QueryResult<R>> {
      const client = await createClient();
      return client.query<R>(text, values);
    },

    connect: createClient,
  };
}
