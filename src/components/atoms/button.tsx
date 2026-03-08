import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        primary:
          "bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-400",
        secondary:
          "bg-transparent border-2 border-slate-600 text-slate-100 hover:bg-slate-700/30",
        tertiary:
          "bg-transparent border-b-2 border-slate-600 text-slate-100 hover:text-slate-200 rounded-none",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  startIcon?: React.ReactElement;
  endIcon?: React.ReactElement;
}

export default function Button({
  className,
  variant,
  size,
  startIcon,
  endIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {startIcon && <span className="mr-2 flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}
    </button>
  );
}