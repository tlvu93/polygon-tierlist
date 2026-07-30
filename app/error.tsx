"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// App Router error boundary: catches rendering/runtime errors thrown by
// any route segment nested under app/ (dashboard, tier-list, auth, etc.)
// so a crash in one part of the tree shows a recoverable error screen
// instead of a blank page / full app crash. Previously there was no
// error.tsx anywhere in the app, so no route had this protection.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      role="alert"
    >
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred while loading this page. You can try
          again, or head back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
