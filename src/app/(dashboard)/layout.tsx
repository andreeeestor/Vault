import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mapStorageUsage } from "@/lib/mappers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true, storageUsed: true, storageLimit: true, plan: true },
  });

  if (!dbUser) redirect("/login");

  const user = {
    name: dbUser.name ?? "Usuário",
    email: dbUser.email,
    image: dbUser.image,
  };

  const storage = mapStorageUsage(dbUser);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex bg-[var(--background)]">
        <Sidebar user={user} storage={storage} />
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
      <CommandPalette />
    </TooltipProvider>
  );
}
