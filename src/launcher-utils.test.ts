import { describe, expect, it } from "vitest";
import { buildLauncherResults } from "./launcher-utils";
import type { FileNode } from "./types";

const files: FileNode[] = [
  {
    id: "desktop",
    name: "Desktop",
    parentId: null,
    type: "folder",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "documents",
    name: "Documents",
    parentId: null,
    type: "folder",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "welcome-note",
    name: "Welcome Note.md",
    parentId: "desktop",
    type: "text",
    createdAt: "",
    updatedAt: "",
  },
];

describe("launcher utils", () => {
  it("prioritizes exact and prefix app matches", () => {
    const results = buildLauncherResults(files, "set");
    expect(results[0]).toMatchObject({
      kind: "app",
      id: "settings",
    });
  });

  it("includes file paths in file result details", () => {
    const results = buildLauncherResults(files, "welcome");
    expect(results[0]).toMatchObject({
      kind: "file",
      id: "welcome-note",
      detail: "Desktop",
    });
  });
});
