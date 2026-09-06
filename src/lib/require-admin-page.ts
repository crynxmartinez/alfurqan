import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Guards an Admin-only dashboard page. Teachers get redirected to the
// dashboard home instead of seeing Admin-only data.
export async function requireAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }
}
