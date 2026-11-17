import { loadSite } from "@/lib/server/content";
import { json } from "@/lib/server/http";

export async function GET() {
  return json(await loadSite());
}
