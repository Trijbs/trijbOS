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
