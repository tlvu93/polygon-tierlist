import { Button } from "@/components/ui/button"
import Header from "@/components/Header"
import Link from "next/link"

export default function TierListPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Header />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tier List {params.id}</h1>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>This is the detailed view of Tier List {params.id}.</p>
          <p>You can implement the full tier list functionality here.</p>
        </div>
      </main>
    </div>
  )
}

