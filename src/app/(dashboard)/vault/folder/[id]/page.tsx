import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listFolderTree } from "@/actions/folders";
import { listAllItems } from "@/actions/items";
import { mapFolder, mapItem } from "@/lib/mappers";
import { VaultStoreHydrator } from "@/components/vault/vault-store-hydrator";
import { VaultFolderView } from "@/components/vault/vault-folder-view";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const folder = folders.find((f) => f.id === id);
  if (!folder) redirect("/vault");

  return (
    <>
      <VaultStoreHydrator folders={folders} items={items} />
      <VaultFolderView folderId={id} />
    </>
  );
}
