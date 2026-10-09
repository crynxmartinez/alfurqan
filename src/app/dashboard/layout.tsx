import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/require-staff";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role ?? "TEACHER";
  const name = session.user.name ?? session.user.email ?? "User";

  return (
    <DashboardShell role={role} name={name}>
      {children}
    </DashboardShell>
  );
}
