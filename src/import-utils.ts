import type { DesktopSnapshot, FileKind, FileNode } from "./types";

export function inferFileKind(file: File): FileKind {
  if (file.type.startsWith("image/")) {
    return "image";
  }
  return "text";
}

export async function readBrowserFile(file: File): Promise<Pick<FileNode, "type" | "content" | "mimeType">> {
  const type = inferFileKind(file);

  if (type === "image") {
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    return {
      type,
      content,
      mimeType: file.type,
    };
  }

  return {
    type,
    content: await file.text(),
    mimeType: file.type || "text/plain",
  };
}

export function isDesktopSnapshot(input: unknown): input is DesktopSnapshot {
  if (!input || typeof input !== "object") {
    return false;
  }

  const candidate = input as Record<string, unknown>;
  return (
    typeof candidate.exportedAt === "string" &&
    Array.isArray(candidate.files) &&
    Array.isArray(candidate.notifications) &&
    Array.isArray(candidate.windows) &&
    typeof candidate.theme === "object" &&
    candidate.theme !== null
  );
}
