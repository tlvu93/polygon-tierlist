"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewTierList() {
  const router = useRouter();

  const handleCreateTierList = () => {
    // For now, just redirect to dashboard
    // In the future, this could create a new tier list and redirect to the editor
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            PolyTierList
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold mb-6">Create New Tier List</h1>

          {/* Placeholder for tier list editor */}
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-500">Tier list editor coming soon...</p>
              <p className="text-sm text-gray-400 mt-2">
                Use the dashboard to create and manage your tier lists
              </p>
              <Button onClick={handleCreateTierList} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
