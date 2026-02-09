import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
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
          "w-full bg-slate-700 text-slate-100 placeholder:text-slate-400 p-2 rounded-md border border-slate-900 " +
            "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 " +
            "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
          className
        )}
        {...props}
      />
    </div>
  )
}
