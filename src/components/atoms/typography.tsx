import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      default: "text-base",

      bodySmall: "text-base",
      bodyMedium: "text-lg",
      bodyLarge: "text-xl",

      linkSmall: "text-base text-blue-400 underline",
      linkMedium: "text-lg text-blue-400 underline",
      linkLarge: "text-xl text-blue-400 underline",

      h1: "text-4xl font-bold",
      h2: "text-3xl font-bold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
      h5: "text-lg font-medium",
      h6: "text-base font-medium",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
  children: React.ReactNode
}

export default function Typography({
  as: Component = "span",
  variant,
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}