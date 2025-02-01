import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PolygonChart } from "@/components/tier-list/PolygonChart";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl text-center px-4 space-y-6 sm:space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Create and Share Poly Tier Lists
        </h1>
        <div className="h-[250px] sm:h-[300px] w-full">
          <PolygonChart
            stats={{
              "Analytical Thinking": 9,
              Resilience: 8,
              Creativity: 7,
              Craftmanship: 7,
              "Social Intelligence": 5,
            }}
          />
        </div>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600">
          Organize, rank, and share your favorite items in beautiful tier lists. Perfect for games, movies, music, or
          anything you want to rank.
        </p>
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full">
              Login
            </Button>
          </Link>
          <Link href="/tier-list/new" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full">
              Continue without Registration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
