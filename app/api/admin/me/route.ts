import { currentAdmin } from "@/lib/server/auth";
import { fail, json } from "@/lib/server/http";

export async function GET() {
  const admin = await currentAdmin();
  return admin ? json(admin) : fail("Não autenticado", 401);
}
