import "./env";
import { readdirSync, readFileSync } from "node:fs";
import { db } from "../lib/server/db";

const pool = db();
await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);

const applied = new Set((await pool.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
const files = readdirSync("db/migrations").filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  if (applied.has(file)) continue;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(readFileSync(`db/migrations/${file}`, "utf8"));
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    await client.query("COMMIT");
    console.log(`Aplicada: ${file}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(`Falhou em ${file}:`, (e as Error).message);
    process.exitCode = 1;
    break;
  } finally {
    client.release();
  }
}
console.log("Migrações em dia.");
await pool.end();
