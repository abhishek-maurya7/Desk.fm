import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export default function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-slate-300 text-sm">
          {label}
        </label>
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
    </div>
  );
}
