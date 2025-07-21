import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PortalClientLayout from "./PortalClientLayout";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PACIENTE') {
    redirect("/conta/login");
  }

  return <PortalClientLayout session={session}>{children}</PortalClientLayout>;
}
