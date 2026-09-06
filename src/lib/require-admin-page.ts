import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Guards a page open to both Admin and Teacher. Anyone else (or logged
// out — though the dashboard layout already handles that) gets redirected
// to the dashboard home.
export async function requireStaffPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
    redirect("/dashboard");
  }
}

// Guards a page restricted to Admins only (currently just Teacher-account
// management — creating logins for other staff).
export async function requireAdminOnlyPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }
}
