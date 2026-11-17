import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";
import { currentUser } from "@/lib/server/auth";
import "./admin.css";

export const metadata: Metadata = { title: "Painel · Graziela Pires Confeitaria", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// A checagem é feita no servidor: sem sessão de ADMIN, o painel nem é renderizado.
// (A proteção real continua em cada rota /api/admin/*.)
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return <AdminLogin />;
  return <AdminShell name={user.name}>{children}</AdminShell>;
}
