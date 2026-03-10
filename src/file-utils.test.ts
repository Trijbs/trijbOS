import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbs,
  buildFilePath,
  canMoveFileToParent,
  getFileTargetApp,
  getMoveTargets,
  sortDirectoryEntries,
  toggleFileSelection,
} from "./file-utils";
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

  it("builds a readable file path from breadcrumbs", () => {
    expect(buildFilePath(files, "note-1")).toBe("Desktop / Note.md");
    expect(buildFilePath(files, "desktop")).toBe("Desktop");
  });

  it("prevents moving a folder into itself or a descendant", () => {
    const nestedFolder: FileNode = {
      id: "folder-1",
      name: "Folder",
      parentId: "desktop",
      type: "folder",
      createdAt: "",
      updatedAt: "",
    };
    const nestedChild: FileNode = {
      id: "folder-2",
      name: "Child",
      parentId: "folder-1",
      type: "folder",
      createdAt: "",
      updatedAt: "",
    };

    const tree = [...files, nestedFolder, nestedChild];
    expect(canMoveFileToParent(tree, "folder-1", "folder-1")).toBe(false);
    expect(canMoveFileToParent(tree, "folder-1", "folder-2")).toBe(false);
    expect(canMoveFileToParent(tree, "folder-1", "desktop")).toBe(true);
  });

  it("returns valid folder move targets for the current selection", () => {
    const folderA: FileNode = {
      id: "folder-a",
      name: "Folder A",
      parentId: "desktop",
      type: "folder",
      createdAt: "",
      updatedAt: "",
    };
    const folderB: FileNode = {
      id: "folder-b",
      name: "Folder B",
      parentId: "desktop",
      type: "folder",
      createdAt: "",
      updatedAt: "",
    };

    const targets = getMoveTargets([...files, folderA, folderB], "desktop", ["note-1"]);
    expect(targets.map((item) => item.id)).toEqual(["folder-a", "folder-b"]);
  });
});
