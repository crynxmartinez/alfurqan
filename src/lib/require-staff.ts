import { auth } from "@/lib/auth";

// Admin and Teacher both manage school data (school years, sections,
// subjects, students, enrollments) now — only Teacher-account management
// itself stays Admin-only (see requireAdminOnly).
export async function requireStaff() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return null;
  }
  return session;
}

// Managing Teacher accounts (creating/editing/deleting login credentials
// for other staff) stays restricted to Admins.
export async function requireAdminOnly() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}
