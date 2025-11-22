import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/guards";
import { canManageTeams } from "@/types/hr-team";

import WorkManagementClient from "./WorkManagementClient";

export default async function WorkManagementPage() {
  const user = await requireUser();

  if (!canManageTeams(user.role)) {
    redirect("/hr-admin");
  }

  return <WorkManagementClient />;
}
