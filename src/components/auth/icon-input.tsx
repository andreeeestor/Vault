import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
  rightSlot?: ReactNode;
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  ({ icon, rightSlot, className, ...props }, ref) => (
    <div className="relative">
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]">
        {icon}
      </span>
      <Input
        ref={ref}
        className={cn(
          "h-[52px] rounded-full border-[1.5px] border-[var(--border)] pl-12 text-sm transition-all focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]",
          rightSlot ? "pr-12" : "pr-5",
          className,
        )}
        {...props}
      />
      {rightSlot && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightSlot}
        </span>
      )}
    </div>
  ),
);
IconInput.displayName = "IconInput";
