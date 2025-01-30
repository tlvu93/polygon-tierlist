// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Check if this was a password reset
        if (next.includes("update-password")) {
          return NextResponse.redirect(`${origin}/auth/update-password`);
        }

        // Get the user profile
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Check if profile exists
        const { data: profile } = await supabase.from("profiles").select().eq("id", user?.id).single();

        // If no profile exists, create one
        if (!profile && user) {
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: user.id,
              username: user.email?.split("@")[0],
              avatar_url: null,
            },
          ]);

          if (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }

        return NextResponse.redirect(`${origin}${next}`);
      }

      return NextResponse.redirect(`${origin}/auth/login?message=${encodeURIComponent(error.message)}`);
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        `${origin}/auth/login?message=${encodeURIComponent("An error occurred during authentication")}`
      );
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?message=${encodeURIComponent("No authentication code provided")}`);
}
