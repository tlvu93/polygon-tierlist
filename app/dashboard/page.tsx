import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return <DashboardContent />;
}
