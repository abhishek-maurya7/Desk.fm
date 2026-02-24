"use client";

import React, { useState } from "react";
import { Button, Input, Typography } from "@/components/atoms";
import { Form } from "@/components/molecules";
import { useRouter } from "next/navigation";

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Signup failed");
      }

      if (data.userId) {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      aria-label="Signup form"
      className="w-full mx-auto rounded-2xl border border-white/10 bg-linear-to-b from-[#1f2024] to-[#16171a] p-6 sm:p-8 shadow-xl flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1 text-center">
        <Typography variant="h4" className="text-white">
          Create your account
        </Typography>
        <Typography variant="bodySmall" className="text-white/60">
          Join us and get started
        </Typography>
      </div>

      <Input
        id="name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="John Doe"
        label={
          <Typography as="label" variant="bodySmall" className="text-white/80">
            Full Name
          </Typography>
        }
        required
        autoComplete="name"
        className="border border-white/10 bg-[#0f1116] text-white placeholder:text-white/40 hover:border-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
      />

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
        className="border border-white/10 bg-[#0f1116] text-white placeholder:text-white/40 hover:border-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
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
        autoComplete="new-password"
        className="border border-white/10 bg-[#0f1116] text-white placeholder:text-white/40 hover:border-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
      />

      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        label={
          <Typography as="label" variant="bodySmall" className="text-white/80">
            Confirm Password
          </Typography>
        }
        required
        autoComplete="new-password"
        className="border border-white/10 bg-[#0f1116] text-white placeholder:text-white/40 hover:border-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
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
        <Typography>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Typography>
      </Button>
    </Form>
  );
}