import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mapStorageUsage, mapFolder, mapItem } from "@/lib/mappers";
import { listFolderTree } from "@/actions/folders";
import { listAllItems } from "@/actions/items";
import { VaultStoreHydrator } from "@/components/vault/vault-store-hydrator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [dbUser, rawFolders, rawItems] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, storageUsed: true, storageLimit: true, plan: true },
    }),
    listFolderTree(userId),
    listAllItems(userId),
  ]);

  if (!dbUser) redirect("/login");

  const user = {
    name: dbUser.name ?? "Usuário",
    email: dbUser.email,
    image: dbUser.image,
  };

  const folders = rawFolders.map(mapFolder);
  const items = rawItems.map(mapItem);
  const storage = mapStorageUsage(dbUser);

  return (
    <TooltipProvider delayDuration={300}>
      <VaultStoreHydrator folders={folders} items={items} user={user} />
      <div className="flex bg-[var(--background)]">
        <Sidebar user={user} storage={storage} />
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
      <CommandPalette />
    </TooltipProvider>
  );
}
