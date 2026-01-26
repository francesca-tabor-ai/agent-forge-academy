import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        {
          "bg-primary text-primary-foreground border-primary-border": variant === "default",
          "bg-secondary text-secondary-foreground border-secondary-border": variant === "secondary",
          "bg-destructive text-destructive-foreground border-destructive-border": variant === "destructive",
          "border-border": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
