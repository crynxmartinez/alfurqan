import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/require-staff";

// Guards a page open to both Admin and Teacher. Anyone else (or logged
// out — though the dashboard layout already handles that) gets redirected
// to the dashboard home.
export async function requireStaffPage() {
  const session = await requireStaff();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
    redirect("/login");
  }
}

// Guards a page restricted to Admins only (currently just Teacher-account
// management — creating logins for other staff).
export async function requireAdminOnlyPage() {
  const session = await requireStaff();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }
}
