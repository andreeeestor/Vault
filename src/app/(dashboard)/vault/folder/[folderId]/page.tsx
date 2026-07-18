import { VaultFolderView } from "@/components/vault/vault-folder-view";

export default async function VaultFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  return <VaultFolderView folderId={folderId} />;
}
