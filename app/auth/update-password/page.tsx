import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only allow access if user has a session (i.e., clicked reset password link)
  if (!session) {
    redirect("/auth/login?message=Please request a password reset first");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <UpdatePasswordForm />
    </div>
  );
}
