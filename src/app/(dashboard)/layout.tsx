import { Sidebar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex bg-[var(--background)]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
      <CommandPalette />
    </TooltipProvider>
  );
}
