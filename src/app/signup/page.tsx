import { SignupForm } from "@/components/organisms";

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md p-6">
        <SignupForm />
      </div>
    </main>
  );
}
