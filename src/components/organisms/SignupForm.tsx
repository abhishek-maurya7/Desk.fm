"use client";

import { useState } from "react"
import { Button, Input, Typography } from "@/components/atoms"
import { Form } from "@/components/molecules"
import { useRouter } from "next/navigation"

interface SignupFormState {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignupForm() {
  const [formData, setFormData] = useState<SignupFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if(data.error) {
        throw new Error(data.error)
      }

      if (data.userId) {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form
      className="flex flex-col gap-4 p-6 bg-slate-800 rounded-md w-full max-w-md mx-auto"
      onSubmit={handleSubmit}
      aria-label="Signup form"
    >
      <Input
        id="name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your full name..."
        label={<Typography as="label" variant="bodySmall">Full Name</Typography>}
        required
        autoComplete="name"
      />

      <Input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email..."
        label={<Typography as="label" variant="bodySmall">Email</Typography>}
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
        label={<Typography as="label" variant="bodySmall">Password</Typography>}
        required
        autoComplete="new-password"
      />

      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password..."
        label={<Typography as="label" variant="bodySmall">Confirm Password</Typography>}
        required
        autoComplete="new-password"
      />

      <Button type="submit">Sign Up</Button>
    </Form>
  )
}
