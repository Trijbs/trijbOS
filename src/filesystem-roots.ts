export const filesystemRoots = [
  { id: "desktop", name: "Desktop" },
  { id: "documents", name: "Documents" },
  { id: "downloads", name: "Downloads" },
  { id: "pictures", name: "Pictures" },
  { id: "trash", name: "Trash" },
] as const;

const protectedNodeIds = new Set(filesystemRoots.map((root) => root.id));

export function isProtectedFileNode(id: string) {
  return protectedNodeIds.has(id);
}
