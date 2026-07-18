"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-[var(--radius-sm)] bg-[var(--foreground)] px-2.5 py-1.5 text-xs font-medium text-[var(--background)] shadow-[var(--shadow-md)]",
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in duration-150",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
