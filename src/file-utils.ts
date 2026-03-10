import type { AppId, FileNode } from "./types";

export function getFileTargetApp(file: FileNode): AppId {
  if (file.type === "image") {
    return "media-viewer";
  }
  if (file.type === "text") {
    return "notes";
  }
  return "file-explorer";
}

export function buildBreadcrumbs(files: FileNode[], activeDirectoryId: string | null) {
  if (!activeDirectoryId) {
    return [];
  }

  const byId = new Map(files.map((file) => [file.id, file]));
  const trail: FileNode[] = [];
  let cursor = byId.get(activeDirectoryId);

  while (cursor) {
    trail.unshift(cursor);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return trail;
}

export function sortDirectoryEntries(entries: FileNode[]) {
  return [...entries].sort((left, right) => {
    if (left.type === "folder" && right.type !== "folder") {
      return -1;
    }
    if (left.type !== "folder" && right.type === "folder") {
      return 1;
    }
    return left.name.localeCompare(right.name);
  });
}

export function toggleFileSelection(current: string[], id: string) {
  return current.includes(id)
    ? current.filter((fileId) => fileId !== id)
    : [...current, id];
}

export function buildFilePath(files: FileNode[], fileId: string | null) {
  const breadcrumbs = buildBreadcrumbs(files, fileId);
  return breadcrumbs.map((item) => item.name).join(" / ");
}

export function canMoveFileToParent(files: FileNode[], fileId: string, targetParentId: string | null) {
  if (fileId === targetParentId) {
    return false;
  }

  const byId = new Map(files.map((file) => [file.id, file]));
  let cursor = targetParentId ? byId.get(targetParentId) : undefined;

  while (cursor) {
    if (cursor.id === fileId) {
      return false;
    }
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return true;
}

export function getMoveTargets(files: FileNode[], activeDirectoryId: string | null, selectedFileIds: string[]) {
  const selectedSet = new Set(selectedFileIds);

  return sortDirectoryEntries(
    files.filter((item) => {
      if (item.type !== "folder") {
        return false;
      }

      if (selectedSet.has(item.id)) {
        return false;
      }

      if (item.id === activeDirectoryId) {
        return false;
      }

      return selectedFileIds.every((fileId) => canMoveFileToParent(files, fileId, item.id));
    }),
  );
}
