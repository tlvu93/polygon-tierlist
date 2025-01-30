import TierListLayout from "@/components/tier-list/TierListLayout";

export default async function TierListPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // You can use the id to fetch the specific tier list data
  console.log("Tier List ID:", params.id);

  return <TierListLayout />;
}
