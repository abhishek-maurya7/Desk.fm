"use client";

import { LoginForm } from "@/components/organisms";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md p-6">
        <LoginForm />
      </div>
    </main>
  )
}
