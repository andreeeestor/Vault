import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listFolderTree } from "@/actions/folders";
import { listAllItems } from "@/actions/items";
import { mapFolder, mapItem } from "@/lib/mappers";
import { VaultStoreHydrator } from "@/components/vault/vault-store-hydrator";
import { VaultFolderView } from "@/components/vault/vault-folder-view";

export default async function VaultFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [rawFolders, rawItems] = await Promise.all([
    listFolderTree(userId),
    listAllItems(userId),
  ]);

  const folders = rawFolders.map(mapFolder);
  const items = rawItems.map(mapItem);

  // Verificar se pasta pertence ao usuário
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) redirect("/vault");

  const user = session.user
    ? {
        name: session.user.name ?? "Usuário",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null;

  return (
    <>
      <VaultStoreHydrator folders={folders} items={items} user={user} />
      <VaultFolderView folderId={folderId} />
    </>
  );
}
