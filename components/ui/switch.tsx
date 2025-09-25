"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Larger, higher-contrast track for better off-state visibility
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all outline-none",
        // Color states
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground/10 dark:data-[state=unchecked]:bg-foreground/20",
        // Track border is always visible
        "border-foreground/25 shadow-xs",
        // Accessible focus styles
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Larger thumb with subtle ring/shadow for visibility in off state
          "pointer-events-none block size-5 rounded-full bg-background shadow transition-transform ring-1 ring-foreground/20 dark:ring-foreground/30",
          // State styles
          "dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground",
          // Positioning
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
