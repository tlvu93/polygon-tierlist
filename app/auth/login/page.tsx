import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: { message?: string } }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      {searchParams?.message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-md">{searchParams.message}</div>
      )}
      <LoginForm />
    </div>
  );
}
