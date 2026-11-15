import "./env";
import { createInterface } from "node:readline";
import { db } from "../lib/server/db";
import { hashPassword } from "../lib/server/auth-hash";

// uso: npm run admin:create -- email@exemplo.com "Nome"   (a senha é pedida sem eco)
const [email, name = "Administrador"] = process.argv.slice(2);
if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Uso: npm run admin:create -- email@exemplo.com "Nome"');
  process.exit(1);
}

function askHidden(q: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const w = (rl as any)._writeToOutput;
    (rl as any)._writeToOutput = (s: string) => { if (s.startsWith(q)) w.call(rl, s); };
    rl.question(q, (a) => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}

const pw = process.env.ADMIN_PASSWORD ?? (await askHidden("Senha (mín. 12 caracteres): "));
if (pw.length < 12) {
  console.error("Senha curta demais (mínimo 12 caracteres).");
  process.exit(1);
}
await db().query(
  `INSERT INTO admins (email, name, password_hash) VALUES ($1,$2,$3)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name`,
  [email.toLowerCase(), name, await hashPassword(pw)],
);
// trocar a senha invalida as sessões abertas
await db().query("DELETE FROM sessions WHERE admin_id = (SELECT id FROM admins WHERE email=$1)", [email.toLowerCase()]);
console.log(`Admin ${email} criado/atualizado.`);
await db().end();
