import "./env";
import { readFileSync } from "node:fs";
import { db } from "../lib/server/db";

await db().query(readFileSync("db/schema.sql", "utf8"));
console.log("Schema aplicado.");
await db().end();
