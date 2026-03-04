"use client";

import { useState } from "react";
import { Button, Input, Typography } from "@/components/atoms";
import { Form } from "@/components/molecules";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoginFormState {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      aria-label="Login form"
      className="w-full mx-auto rounded-2xl border border-white/10 bg-linear-to-b from-[#1f2024] to-[#16171a] p-6 sm:p-8 shadow-xl flex flex-col gap-6
      "
    >
      <div className="flex flex-col gap-1 text-center">
        <Typography variant="h4" className="text-white">
          Welcome back
        </Typography>
        <Typography variant="bodySmall" className="text-white/60">
          Sign in to your account
        </Typography>
      </div>

      <Input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="you@example.com"
        label={
          <Typography as="label" variant="bodySmall" className="text-white/80">
            Email
          </Typography>
        }
        required
        autoComplete="email"
        className="border border-white/10 bg-[#0f1116] text-white placeholder:text-white/40 hover:border-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition
        "
      />

      <Input
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        label={
          <Typography as="label" variant="bodySmall" className="text-white/80">
            Password
          </Typography>
        }
        required
        autoComplete="current-password"
        className="border border-white/10 bg-[#0f1116] text-white placeholder:text-white/40 hover:border-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition
        "
      />

      {error && (
        <Typography variant="bodySmall" className="text-red-400 text-center">
          {error}
        </Typography>
      )}

      <Button
        variant="primary"
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        <Typography>{isLoading ? "Signing in..." : "Login"}</Typography>
      </Button>
    </Form>
  );
}
