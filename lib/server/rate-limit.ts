import { db } from "./db";

/**
 * Reserva uma tentativa de forma atômica. O advisory lock serializa requisições
 * do mesmo bucket/chave, evitando que duas chamadas ultrapassem o limite juntas.
 */
export async function hit(bucket: string, key: string, limit: number, windowSec: number): Promise<boolean> {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [bucket, key]);
    const { rows } = await client.query(
      `SELECT count(*)::int AS n FROM rate_events
       WHERE bucket=$1 AND key=$2 AND created_at > now() - make_interval(secs => $3)`,
      [bucket, key, windowSec],
    );
    if (rows[0].n >= limit) {
      await client.query("COMMIT");
      return false;
    }
    await client.query("INSERT INTO rate_events (bucket, key) VALUES ($1,$2)", [bucket, key]);
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function exceeded(bucket: string, key: string, limit: number, windowSec: number): Promise<boolean> {
  const { rows } = await db().query(
    `SELECT count(*)::int AS n FROM rate_events
     WHERE bucket=$1 AND key=$2 AND created_at > now() - make_interval(secs => $3)`,
    [bucket, key, windowSec],
  );
  return rows[0].n >= limit;
}

export async function reset(bucket: string, key: string) {
  await db().query("DELETE FROM rate_events WHERE bucket=$1 AND key=$2", [bucket, key]);
}

export async function cleanup() {
  await db().query("DELETE FROM rate_events WHERE created_at < now() - interval '1 day'");
  await db().query("DELETE FROM sessions WHERE expires_at < now()");
}
