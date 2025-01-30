import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Create and Share Tier Lists</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Organize, rank, and share your favorite items in beautiful tier lists. Perfect for games, movies, music, or
          anything you want to rank.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/auth/login">
            <Button size="lg" className="text-lg px-8">
              Login
            </Button>
          </Link>
          <Link href="/tier-list/new">
            <Button variant="outline" size="lg" className="text-lg px-8">
              Continue without Registration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
