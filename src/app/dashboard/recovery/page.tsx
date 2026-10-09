import { requireAdminOnlyPage } from "@/lib/require-admin-page";
import { RecoveryManager } from "./recovery-manager";
export default async function RecoveryPage() {
  await requireAdminOnlyPage();
  return <RecoveryManager />;
}
