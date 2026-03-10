import { appDefinitions } from "./apps";
import { buildFilePath } from "./file-utils";
import type { AppId, FileNode } from "./types";

export type LauncherResult =
  | { id: AppId; kind: "app"; label: string; detail: string; score: number }
  | { id: string; kind: "file"; label: string; detail: string; score: number };

function scoreMatch(label: string, haystack: string, normalizedQuery: string) {
  if (normalizedQuery.length === 0) {
    return 1;
  }

  if (label.toLowerCase() === normalizedQuery) {
    return 120;
  }

  if (label.toLowerCase().startsWith(normalizedQuery)) {
    return 90;
  }

  if (haystack.startsWith(normalizedQuery)) {
    return 70;
  }

  if (haystack.includes(normalizedQuery)) {
    return 40;
  }

  return -1;
}

export function buildLauncherResults(files: FileNode[], query: string): LauncherResult[] {
  const normalized = query.trim().toLowerCase();

  const appResults: LauncherResult[] = Object.values(appDefinitions)
    .map((app) => {
      const haystack = `${app.title} ${app.description} ${app.keywords.join(" ")}`.toLowerCase();
      return {
        id: app.id,
        kind: "app" as const,
        label: app.title,
        detail: app.description,
        score: scoreMatch(app.title, haystack, normalized),
      };
    })
    .filter((result) => result.score >= 0);

  const fileResults: LauncherResult[] = normalized.length === 0
    ? []
    : files
        .map((node) => {
          const path = buildFilePath(files, node.parentId);
          const haystack = `${node.name} ${path}`.toLowerCase();
          return {
            id: node.id,
            kind: "file" as const,
            label: node.name,
            detail: path || "Root",
            score: scoreMatch(node.name, haystack, normalized),
          };
        })
        .filter((result) => result.score >= 0);

  return [...appResults, ...fileResults]
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))
    .slice(0, 8);
}
