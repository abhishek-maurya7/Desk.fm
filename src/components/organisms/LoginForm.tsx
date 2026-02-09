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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      console.log("success");

      router.push("/dashboard");
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
    }
  };

  return (
    <Form
      className="flex flex-col gap-4 p-6 bg-slate-800 rounded-md w-full max-w-md mx-auto"
      onSubmit={handleSubmit}
      aria-label="Login form"
    >
      <Input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email..."
        label={
          <Typography as="label" variant="bodySmall">
            Email
          </Typography>
        }
        required
        autoComplete="email"
      />

      <Input
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password..."
        label={
          <Typography as="label" variant="bodySmall">
            Password
          </Typography>
        }
        required
        autoComplete="current-password"
      />
      <Button type="submit">
        <Typography>Login</Typography>
      </Button>
    </Form>
  );
}
