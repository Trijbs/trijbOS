import { describe, expect, it } from "vitest";
import { buildBreadcrumbs, getFileTargetApp, sortDirectoryEntries, toggleFileSelection } from "./file-utils";
import type { FileNode } from "./types";

const files: FileNode[] = [
  {
    id: "desktop",
    name: "Desktop",
    parentId: null,
    type: "folder",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "note-1",
    name: "Note.md",
    parentId: "desktop",
    type: "text",
    content: "hello",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "image-1",
    name: "Glow.glow",
    parentId: "desktop",
    type: "image",
    content: "gradient",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
];

describe("file utils", () => {
  it("maps files to the correct default app", () => {
    expect(getFileTargetApp(files[1])).toBe("notes");
    expect(getFileTargetApp(files[2])).toBe("media-viewer");
    expect(getFileTargetApp(files[0])).toBe("file-explorer");
  });

  it("builds breadcrumbs from parent links", () => {
    expect(buildBreadcrumbs(files, "note-1").map((item) => item.id)).toEqual(["desktop", "note-1"]);
  });

  it("sorts folders before files", () => {
    const extraFolder: FileNode = {
      id: "folder-1",
      name: "Alpha",
      parentId: "desktop",
      type: "folder",
      createdAt: "2026-03-10T00:00:00.000Z",
      updatedAt: "2026-03-10T00:00:00.000Z",
    };

    expect(sortDirectoryEntries([files[2], files[1], extraFolder]).map((item) => item.id)).toEqual([
      "folder-1",
      "image-1",
      "note-1",
    ]);
  });

  it("toggles file selection membership", () => {
    expect(toggleFileSelection([], "note-1")).toEqual(["note-1"]);
    expect(toggleFileSelection(["note-1", "image-1"], "note-1")).toEqual(["image-1"]);
  });
});
