"use client";

import { useRouter } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getFolderPath, useVaultStore } from "@/lib/vault-store";
import { cn } from "@/lib/utils";

export function BreadcrumbNav() {
  const router = useRouter();
  const folders = useVaultStore((s) => s.folders);
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const drag = useVaultStore((s) => s.drag);
  const setDropTarget = useVaultStore((s) => s.setDropTarget);
  const moveEntities = useVaultStore((s) => s.moveEntities);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);

  const path = getFolderPath(folders, currentFolderId);

  const navigate = (id: string) => {
    setCurrentFolder(id);
    router.push(id === "root" ? "/vault" : `/vault/folder/${id}`);
  };

  return (
    <div className="flex max-w-full items-center overflow-x-auto whitespace-nowrap scrollbar-none py-1">
      <Breadcrumb>
      {path.map((folder, index) => {
        const isLast = index === path.length - 1;
        const dropId = `breadcrumb:${folder.id}`;
        const isDropTarget = drag.isDragging && drag.hoveredDropTargetId === dropId && !isLast;

        return (
          <span key={folder.id} className="flex items-center gap-1">
            <button
              onClick={() => !isLast && navigate(folder.id)}
              disabled={isLast}
              onDragOver={(e) => {
                if (!drag.isDragging || isLast) return;
                e.preventDefault();
                setDropTarget(dropId);
              }}
              onDragLeave={() => drag.hoveredDropTargetId === dropId && setDropTarget(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (!drag.isDragging || isLast) return;
                const itemIds = drag.draggedKind === "item" ? drag.draggedIds : [];
                const folderIds = drag.draggedKind === "folder" ? drag.draggedIds : [];
                moveEntities(itemIds, folderIds, folder.id);
              }}
              className={cn(
                "rounded-md transition-colors",
                !isLast && "cursor-pointer hover:bg-[var(--surface-hover)]",
                isDropTarget && "drop-target-active"
              )}
            >
              <BreadcrumbItem active={isLast}>{folder.name}</BreadcrumbItem>
            </button>
            {!isLast && <BreadcrumbSeparator />}
          </span>
        );
      })}
      </Breadcrumb>
    </div>
  );
}
