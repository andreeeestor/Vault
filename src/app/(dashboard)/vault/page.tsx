import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listFolderTree } from "@/actions/folders";
import { listAllItems } from "@/actions/items";
import { mapFolder, mapItem } from "@/lib/mappers";
import { VaultStoreHydrator } from "@/components/vault/vault-store-hydrator";
import { VaultFolderView } from "@/components/vault/vault-folder-view";

export default async function VaultRootPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [rawFolders, rawItems] = await Promise.all([
    listFolderTree(userId),
    listAllItems(userId),
  ]);

  const folders = rawFolders.map(mapFolder);
  const items = rawItems.map(mapItem);

  // Encontrar id da pasta raiz (isRoot = true)
  const rootFolder = folders.find((f) => f.isRoot);
  const rootId = rootFolder?.id ?? "root";

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
      <VaultFolderView folderId={rootId} />
    </>
  );
}
