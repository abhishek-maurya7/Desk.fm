import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-6 max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center">Welcome</h1>

        <div className="flex gap-4 w-full justify-center">
          <Link
            href="/login"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-center"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center"
          >
            Signup
          </Link>
        </div>
      </main>
    </div>
  );
}