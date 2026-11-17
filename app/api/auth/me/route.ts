import { currentUser } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

// 200 com { user: null } quando deslogado: o site consulta isso em todo carregamento.
export async function GET() {
  return json({ user: await currentUser() });
}
