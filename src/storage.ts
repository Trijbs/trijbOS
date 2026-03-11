import Dexie, { type Table } from "dexie";
import { filesystemRoots } from "./filesystem-roots";
import type {
  DesktopSnapshot,
  FileNode,
  LayoutPreset,
  NotificationItem,
  ThemePreference,
  WindowState,
  WorkspaceState,
} from "./types";
import { getStorageBootstrapAction, STORAGE_SCHEMA_VERSION } from "./storage-version";

type PreferenceRecord = {
  key: string;
  value: string;
};

class TrijbOSDatabase extends Dexie {
  preferences!: Table<PreferenceRecord, string>;
  files!: Table<FileNode, string>;
  session!: Table<WindowState, string>;
  notifications!: Table<NotificationItem, string>;

  constructor() {
    super("trijbos");
    this.version(1).stores({
      preferences: "&key",
      files: "&id,parentId,type,updatedAt",
      session: "&id,appId,zIndex",
      notifications: "&id,createdAt",
    });
  }
}

const db = new TrijbOSDatabase();

const defaultTheme: ThemePreference = {
  mode: "system",
  accent: "#7bf7bf",
  wallpaper:
    "radial-gradient(circle at 20% 20%, rgba(123, 247, 191, 0.35), transparent 28%), radial-gradient(circle at 80% 10%, rgba(90, 140, 255, 0.28), transparent 30%), linear-gradient(135deg, #0f1720 0%, #1d2834 52%, #28364d 100%)",
};

const defaultWorkspaceState: WorkspaceState = {
  activeDirectoryId: "desktop",
  selectedFileIds: [],
};

const nowIso = () => new Date().toISOString();

export async function seedDatabase() {
  const now = nowIso();
  const folders: FileNode[] = filesystemRoots.map((folder) => ({
    id: folder.id,
    name: folder.name,
    parentId: null,
    type: "folder",
    createdAt: now,
    updatedAt: now,
  }));

  const starterFiles: FileNode[] = [
    {
      id: "desktop-welcome",
      parentId: "desktop",
      name: "Welcome Note.md",
      type: "text",
      content:
        "# Welcome to trijbOS\n\nThis MVP is optimized around shell usability, persistent state, and a modular app platform.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "pictures-sample",
      parentId: "pictures",
      name: "Nebula.glow",
      type: "image",
      content:
        "radial-gradient(circle at 30% 30%, rgba(116, 215, 255, 0.26), transparent 24%), radial-gradient(circle at 70% 20%, rgba(144, 255, 208, 0.2), transparent 24%), linear-gradient(135deg, #08141c 0%, #163040 50%, #284a56 100%)",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "documents-plan",
      parentId: "documents",
      name: "MVP Plan.md",
      type: "text",
      content:
        "Week 1: shell, windows, launcher, persistence.\nWeek 2: explorer, apps, QA, docs.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.files.bulkPut([...folders, ...starterFiles]);

  const existingTheme = await db.preferences.get("theme");
  await db.preferences.bulkPut(
    [
      { key: "schemaVersion", value: STORAGE_SCHEMA_VERSION },
      { key: "bootstrapped", value: "true" },
      existingTheme ?? { key: "theme", value: JSON.stringify(defaultTheme) },
    ],
  );
}

export async function loadStoredSchemaVersion() {
  return (await db.preferences.get("schemaVersion"))?.value;
}

export async function ensureStorageReady() {
  const storedVersion = await loadStoredSchemaVersion();
  const action = getStorageBootstrapAction(storedVersion);

  switch (action.type) {
    case "seed":
      await seedDatabase();
      return;
    case "noop":
      return;
    case "migrate":
      await migrateStorage(action.from, action.to);
      return;
    case "reset":
      await resetStorage();
      return;
  }
}

export async function loadThemePreference(): Promise<ThemePreference> {
  const record = await db.preferences.get("theme");
  if (!record) {
    return defaultTheme;
  }
  return JSON.parse(record.value) as ThemePreference;
}

export async function saveThemePreference(theme: ThemePreference) {
  await db.preferences.put({ key: "theme", value: JSON.stringify(theme) });
}

export async function loadWorkspaceState(): Promise<WorkspaceState> {
  const record = await db.preferences.get("workspace");
  if (!record) {
    return defaultWorkspaceState;
  }

  try {
    const parsed = JSON.parse(record.value) as WorkspaceState;
    return {
      activeDirectoryId: parsed.activeDirectoryId ?? "desktop",
      selectedFileIds: Array.isArray(parsed.selectedFileIds) ? parsed.selectedFileIds : [],
    };
  } catch {
    return defaultWorkspaceState;
  }
}

export async function saveWorkspaceState(workspace: WorkspaceState) {
  await db.preferences.put({ key: "workspace", value: JSON.stringify(workspace) });
}

export async function loadLayoutPresets(): Promise<LayoutPreset[]> {
  const record = await db.preferences.get("layoutPresets");
  if (!record) {
    return [];
  }

  try {
    const parsed = JSON.parse(record.value) as LayoutPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveLayoutPresets(presets: LayoutPreset[]) {
  await db.preferences.put({ key: "layoutPresets", value: JSON.stringify(presets) });
}

export async function loadFiles() {
  return db.files.toArray();
}

export async function saveFile(node: FileNode) {
  await db.files.put(node);
}

export async function deleteFile(id: string) {
  await db.files.delete(id);
}

export async function loadSession() {
  return db.session.toArray();
}

export async function saveSession(windows: WindowState[]) {
  await db.session.clear();
  if (windows.length > 0) {
    await db.session.bulkPut(windows);
  }
}

export async function loadNotifications() {
  return db.notifications.orderBy("createdAt").reverse().limit(8).toArray();
}

export async function saveNotification(item: NotificationItem) {
  await db.notifications.put(item);
}

export async function deleteNotification(id: string) {
  await db.notifications.delete(id);
}

export async function clearNotificationHistory() {
  await db.notifications.clear();
}

export async function replaceFiles(files: FileNode[]) {
  await db.files.clear();
  if (files.length > 0) {
    await db.files.bulkPut(files);
  }
}

export async function replaceNotifications(notifications: NotificationItem[]) {
  await db.notifications.clear();
  if (notifications.length > 0) {
    await db.notifications.bulkPut(notifications);
  }
}

export async function restoreSnapshot(snapshot: DesktopSnapshot) {
  await replaceFiles(snapshot.files);
  await saveLayoutPresets(snapshot.layoutPresets ?? []);
  await saveThemePreference(snapshot.theme);
  await saveWorkspaceState(snapshot.workspace ?? defaultWorkspaceState);
  await replaceNotifications(snapshot.notifications);
  await saveSession(snapshot.windows);
}

export async function resetStorage() {
  await db.transaction("rw", db.files, db.preferences, db.session, db.notifications, async () => {
    await db.files.clear();
    await db.preferences.clear();
    await db.session.clear();
    await db.notifications.clear();
  });
  await seedDatabase();
}

async function migrateStorage(from: string, to: string) {
  if (from === "0" && to === "1") {
    const existingTheme = await db.preferences.get("theme");
    await seedDatabase();
    if (existingTheme) {
      await db.preferences.put(existingTheme);
    }
    await db.preferences.put({ key: "schemaVersion", value: STORAGE_SCHEMA_VERSION });
    return;
  }

  await resetStorage();
}
