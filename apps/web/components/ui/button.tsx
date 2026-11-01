import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variant === "default" &&
            "bg-zinc-900 text-zinc-50 shadow-sm hover:bg-zinc-800",
          variant === "secondary" &&
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
          variant === "outline" &&
            "border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 hover:text-zinc-900",
          variant === "ghost" &&
            "hover:bg-zinc-100 hover:text-zinc-900",
          variant === "destructive" &&
            "bg-red-600 text-white shadow-sm hover:bg-red-500",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-12 rounded-lg px-8 text-base",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
