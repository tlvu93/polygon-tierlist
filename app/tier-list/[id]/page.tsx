import TierListLayout from "@/components/tier-list/TierListLayout";
import { createClient } from "@/utils/supabase/server";

export default async function TierListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: tierList, error } = await supabase
    .from("tier_lists")
    .select("title")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching tier list:", error);
    return <div>Error loading tier list</div>;
  }

  if (!tierList) {
    return <div>Tier list not found</div>;
  }

  return <TierListLayout id={id} tierListName={tierList.title} />;
}
