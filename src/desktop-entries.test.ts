import { FileText, FolderOpen, ImageIcon, Settings2 } from "lucide-react";
import { describe, expect, it } from "vitest";
import { buildDesktopEntries, defaultDesktopApps, getDesktopFileIcon } from "./desktop-entries";

describe("desktop entries", () => {
  it("keeps the default app shortcuts in the intended order", () => {
    expect(defaultDesktopApps).toEqual([
      "file-explorer",
      "notes",
      "terminal",
      "settings",
    ]);
  });

  it("maps file kinds to the expected desktop icons", () => {
    expect(
      getDesktopFileIcon({
        id: "folder-1",
        name: "Docs",
        parentId: "desktop",
        type: "folder",
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe(FolderOpen);

    expect(
      getDesktopFileIcon({
        id: "image-1",
        name: "Glow",
        parentId: "desktop",
        type: "image",
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe(ImageIcon);

    expect(
      getDesktopFileIcon({
        id: "text-1",
        name: "Note",
        parentId: "desktop",
        type: "text",
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe(FileText);
  });

  it("builds app and desktop file entries together", () => {
    const entries = buildDesktopEntries([
      {
        id: "desktop-note",
        name: "Welcome.md",
        parentId: "desktop",
        type: "text",
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      },
      {
        id: "documents-note",
        name: "Plan.md",
        parentId: "documents",
        type: "text",
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      },
    ]);

    expect(entries).toHaveLength(5);
    expect(entries[0]).toMatchObject({
      id: "file-explorer",
      kind: "app",
      label: "File Explorer",
      icon: FolderOpen,
    });
    expect(entries[3]).toMatchObject({
      id: "settings",
      kind: "app",
      label: "Settings",
      icon: Settings2,
    });
    expect(entries[4]).toMatchObject({
      id: "desktop-note",
      kind: "file",
      label: "Welcome.md",
      icon: FileText,
    });
  });
});
