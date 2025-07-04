"use client";

import { Button } from "@/components/ui/button";
import { PolygonChart } from "@/components/tier-list/PolygonChart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [showPage, setShowPage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (hasVisited) {
      // User has visited before, redirect to dashboard
      router.push("/dashboard");
    } else {
      // First visit, show the landing page
      setShowPage(true);
    }
  }, [router]);

  const handleContinue = () => {
    // Mark as visited and redirect to dashboard
    localStorage.setItem("hasVisitedBefore", "true");
    router.push("/dashboard");
  };

  if (!showPage) {
    return null; // Show nothing while checking localStorage
  }

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
              Craftsmanship: 7,
              "Social Intelligence": 5,
            }}
          />
        </div>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600">
          Organize, rank, and share your favorite items in beautiful tier lists.
          Perfect for games, movies, music, or anything you want to rank.
        </p>
        <div className="mt-6 sm:mt-10 flex items-center justify-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="text-base sm:text-lg px-6 sm:px-8"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
