import * as React from "react";
import { cn } from "@/lib/utils";
import Typography from "./typography";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export default function Input({ label, className, id, ...props }: InputProps) {
  return (
    <>
      {label && (
          {label}
      )}
      <input
        id={id}
        className={cn(
          "w-full  p-2 rounded-md border ",
          "focus:outline-none ",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
          className,
        )}
        {...props}
      />
    </>
  );
}
