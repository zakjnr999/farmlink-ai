import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-target",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-farm-green/90 active:bg-farm-green",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-field-cream/80",
        outline:
          "border border-border bg-transparent hover:bg-muted hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline min-h-0 min-w-0 px-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-tomato-red/90",
        harvest:
          "bg-harvest-gold text-field-ink shadow-sm hover:bg-harvest-gold/90 active:bg-clay-orange/80",
        clay:
          "bg-clay-orange text-warm-paper shadow-sm hover:bg-clay-orange/90",
        farm:
          "bg-gradient-to-b from-leaf-green to-farm-green text-warm-paper shadow-sm hover:from-leaf-green/95 hover:to-farm-green/95",
      },
      size: {
        default: "h-11 min-h-[var(--touch-target)] px-5 py-2 text-sm",
        sm: "h-9 min-h-9 rounded-md px-3 text-xs",
        lg: "h-12 min-h-12 rounded-xl px-8 text-base",
        icon: "size-11 min-h-[var(--touch-target)] min-w-[var(--touch-target)] p-0",
        "icon-sm": "size-9 min-h-9 min-w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
