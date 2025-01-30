import Dashboard from "@/components/Dashboard";

export default function TierListPage({ params }: { params: { id: string } }) {
  // You can use the id to fetch the specific tier list data
  console.log("Tier List ID:", params.id);

  return <Dashboard />;
}
