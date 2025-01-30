"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordForm() {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess("Check your email for the password reset link");
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleReset} className="mt-8 space-y-6">
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-500 text-sm text-center">{success}</div>}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="Enter your email" />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
