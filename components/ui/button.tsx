import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "transition-colors",
          {
            // Variants
            "bg-primary text-primary-foreground border border-primary-border hover:opacity-90":
              variant === "default",
            "bg-secondary text-secondary-foreground border border-secondary-border hover:opacity-90":
              variant === "secondary",
            "bg-destructive text-destructive-foreground border border-destructive-border hover:opacity-90":
              variant === "destructive",
            "border border-border bg-background hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            // Sizes
            "min-h-9 px-4 py-2": size === "default",
            "min-h-8 rounded-md px-3 text-xs": size === "sm",
            "min-h-10 rounded-md px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
