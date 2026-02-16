import { Typography } from "@/components/atoms";
import { LoginForm } from "@/components/organisms";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>

      <div className="mt-6 w-full max-w-md bg-[#14161b] rounded-2xl p-6 shadow-lg text-center border border-gray-800">
        <Typography variant="bodySmall" className="text-white/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-500 font-semibold hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition-colors"
          >
            Sign up
          </Link>
        </Typography>
      </div>
    </main>
  );
}
