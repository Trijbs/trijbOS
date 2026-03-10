import { create } from "zustand";
import { appDefinitions } from "./apps";
import { isProtectedFileNode } from "./filesystem-roots";
import { isDesktopSnapshot, readBrowserFile } from "./import-utils";
import { getFileTargetApp } from "./file-utils";
import { toggleLauncherState, toggleNotificationsState } from "./shell-state";
import {
  clearNotificationHistory,
  deleteFile,
  ensureStorageReady,
  loadFiles,
  loadNotifications,
  loadSession,
  loadThemePreference,
  resetStorage,
  restoreSnapshot,
  saveFile,
  saveNotification,
  saveSession,
  saveThemePreference,
} from "./storage";
import {
  focusWindowState,
  getTopWindow,
  launchAppWindowState,
  maximizeWindowState,
  minimizeWindowState,
  toggleTaskbarWindowState,
  updateWindowBoundsState,
} from "./window-state";
import type {
  AppId,
  FileNode,
  LaunchContext,
  NotificationItem,
  ThemePreference,
  WindowBounds,
  WindowState,
} from "./types";

type HydratedPayload = {
  files: FileNode[];
  notifications: NotificationItem[];
  theme: ThemePreference;
  windows: WindowState[];
};

type SystemState = {
  hydrated: boolean;
  launcherOpen: boolean;
  notificationsOpen: boolean;
  activeDirectoryId: string | null;
  selectedFileId: string | null;
  selectedFileIds: string[];
  theme: ThemePreference;
  files: FileNode[];
  windows: WindowState[];
  notifications: NotificationItem[];
  hydrate: () => Promise<void>;
  toggleLauncher: (forced?: boolean) => void;
  toggleNotifications: (forced?: boolean) => void;
  setActiveDirectory: (directoryId: string | null) => void;
  setSelectedFiles: (fileIds: string[]) => void;
  updateTheme: (patch: Partial<ThemePreference>) => Promise<void>;
  launchApp: (appId: AppId, context?: LaunchContext) => void;
  openFile: (fileId: string) => void;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: WindowBounds) => void;
  restoreWindow: (id: string) => void;
  closeTopWindow: () => void;
  minimizeTopWindow: () => void;
  toggleTopWindowMaximize: () => void;
  toggleTaskbarWindow: (appId: AppId) => void;
  createFile: (input: Pick<FileNode, "name" | "parentId" | "type" | "content">) => Promise<void>;
  updateFile: (id: string, patch: Partial<FileNode>) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  moveFiles: (fileIds: string[], parentId: string | null) => Promise<void>;
  importBrowserFiles: (files: FileList, parentId?: string | null) => Promise<void>;
  importSnapshot: (file: File) => Promise<boolean>;
  resetWorkspace: () => Promise<void>;
  pushNotification: (item: Omit<NotificationItem, "id" | "createdAt">) => Promise<void>;
  clearNotifications: () => Promise<void>;
};

const defaultTheme: ThemePreference = {
  mode: "system",
  accent: "#7bf7bf",
  wallpaper:
    "radial-gradient(circle at 20% 20%, rgba(123, 247, 191, 0.35), transparent 28%), radial-gradient(circle at 80% 10%, rgba(90, 140, 255, 0.28), transparent 30%), linear-gradient(135deg, #0f1720 0%, #1d2834 52%, #28364d 100%)",
};

let persistTimer: number | undefined;
let persistenceQueue = Promise.resolve();
const timerHost = globalThis;

function withPersistedWindows(windows: WindowState[]) {
  if (persistTimer) {
    timerHost.clearTimeout(persistTimer);
  }
  persistTimer = timerHost.setTimeout(() => {
    void saveSession(windows);
  }, 180);
}

function enqueuePersistence<T>(task: () => Promise<T>) {
  const next = persistenceQueue.then(task);
  persistenceQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function normalizeHydratedState(payload: HydratedPayload) {
  return {
    activeDirectoryId: "desktop",
    files: payload.files,
    hydrated: true,
    launcherOpen: false,
    notifications: payload.notifications,
    notificationsOpen: false,
    selectedFileId: null,
    selectedFileIds: [],
    theme: payload.theme,
    windows: payload.windows,
  };
}

export const useSystemStore = create<SystemState>((set, get) => ({
  hydrated: false,
  launcherOpen: false,
  notificationsOpen: false,
  activeDirectoryId: "desktop",
  selectedFileId: null,
  selectedFileIds: [],
  theme: defaultTheme,
  files: [],
  windows: [],
  notifications: [],
  async hydrate() {
    await ensureStorageReady();
    const [files, notifications, theme, windows] = await Promise.all([
      loadFiles(),
      loadNotifications(),
      loadThemePreference(),
      loadSession(),
    ]);
    set(normalizeHydratedState({ files, notifications, theme, windows }));
  },
  toggleLauncher(forced) {
    set((state) => toggleLauncherState(state, forced));
  },
  toggleNotifications(forced) {
    set((state) => toggleNotificationsState(state, forced));
  },
  setActiveDirectory(directoryId) {
    set({ activeDirectoryId: directoryId });
  },
  setSelectedFiles(fileIds) {
    set({ selectedFileIds: fileIds, selectedFileId: fileIds[0] ?? null });
  },
  async updateTheme(patch) {
    const theme = { ...get().theme, ...patch };
    set({ theme });
    await enqueuePersistence(() => saveThemePreference(theme));
  },
  launchApp(appId, context) {
    set((state) => {
      const windows = launchAppWindowState(
        state.windows,
        appId,
        appDefinitions[appId].singleInstance,
      );
      withPersistedWindows(windows);
      return {
        launcherOpen: false,
        selectedFileId: context?.fileId ?? state.selectedFileId,
        windows,
      };
    });
  },
  openFile(fileId) {
    const file = get().files.find((item) => item.id === fileId);
    if (!file) {
      return;
    }

    const nextDirectoryId = file.type === "folder" ? file.id : file.parentId ?? get().activeDirectoryId;
    set({
      activeDirectoryId: nextDirectoryId,
      selectedFileId: fileId,
      selectedFileIds: [fileId],
    });

    get().launchApp(getFileTargetApp(file), { fileId });
  },
  focusWindow(id) {
    set((state) => {
      const windows = focusWindowState(state.windows, id);
      withPersistedWindows(windows);
      return { windows };
    });
  },
  closeWindow(id) {
    set((state) => {
      const windows = state.windows.filter((item) => item.id !== id);
      withPersistedWindows(windows);
      return { windows };
    });
  },
  minimizeWindow(id) {
    set((state) => {
      const windows = minimizeWindowState(state.windows, id);
      withPersistedWindows(windows);
      return { windows };
    });
  },
  maximizeWindow(id) {
    set((state) => {
      const windows = maximizeWindowState(state.windows, id);
      withPersistedWindows(windows);
      return { windows };
    });
  },
  updateWindowBounds(id, bounds) {
    set((state) => {
      const windows = updateWindowBoundsState(state.windows, id, bounds);
      withPersistedWindows(windows);
      return { windows };
    });
  },
  restoreWindow(id) {
    get().focusWindow(id);
  },
  closeTopWindow() {
    const topWindow = getTopWindow(get().windows);
    if (!topWindow) {
      return;
    }
    get().closeWindow(topWindow.id);
  },
  minimizeTopWindow() {
    const topWindow = getTopWindow(get().windows);
    if (!topWindow) {
      return;
    }
    get().minimizeWindow(topWindow.id);
  },
  toggleTopWindowMaximize() {
    const topWindow = getTopWindow(get().windows);
    if (!topWindow) {
      return;
    }
    get().maximizeWindow(topWindow.id);
  },
  toggleTaskbarWindow(appId) {
    const result = toggleTaskbarWindowState(get().windows, appId);
    if (result.type === "launch") {
      get().launchApp(appId);
      return;
    }

    withPersistedWindows(result.windows);
    set({ windows: result.windows });
  },
  async createFile(input) {
    const timestamp = new Date().toISOString();
    const node: FileNode = {
      id: crypto.randomUUID(),
      name: input.name,
      parentId: input.parentId,
      type: input.type,
      content: input.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await saveFile(node);
    set((state) => ({
      files: [...state.files, node],
      selectedFileId: node.id,
      selectedFileIds: [node.id],
    }));
  },
  async updateFile(id, patch) {
    const target = get().files.find((item) => item.id === id);
    if (!target) {
      return;
    }
    const node = { ...target, ...patch, updatedAt: new Date().toISOString() };
    await saveFile(node);
    set((state) => ({
      files: state.files.map((item) => (item.id === id ? node : item)),
    }));
  },
  async removeFile(id) {
    if (isProtectedFileNode(id)) {
      return;
    }
    await deleteFile(id);
    set((state) => ({
      files: state.files.filter((item) => item.id !== id),
      selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
      selectedFileIds: state.selectedFileIds.filter((fileId) => fileId !== id),
    }));
  },
  async moveFiles(fileIds, parentId) {
    const timestamp = new Date().toISOString();
    const idSet = new Set(fileIds);
    const nextFiles = await Promise.all(
      get().files.map(async (item) => {
        if (!idSet.has(item.id)) {
          return item;
        }
        const nextItem = {
          ...item,
          parentId,
          updatedAt: timestamp,
        };
        await saveFile(nextItem);
        return nextItem;
      }),
    );
    set({
      files: nextFiles,
      selectedFileId: fileIds[0] ?? null,
      selectedFileIds: fileIds,
    });
  },
  async importBrowserFiles(fileList, parentId) {
    const targetParentId = parentId ?? get().activeDirectoryId ?? "downloads";
    const importedNodes = await Promise.all(
      Array.from(fileList).map(async (file) => {
        const payload = await readBrowserFile(file);
        const timestamp = new Date().toISOString();
        return {
          id: crypto.randomUUID(),
          name: file.name,
          parentId: payload.type === "image" ? "pictures" : targetParentId,
          type: payload.type,
          content: payload.content,
          mimeType: payload.mimeType,
          createdAt: timestamp,
          updatedAt: timestamp,
        } satisfies FileNode;
      }),
    );

    await Promise.all(importedNodes.map((node) => saveFile(node)));
    set((state) => ({
      files: [...state.files, ...importedNodes],
      selectedFileId: importedNodes.at(-1)?.id ?? state.selectedFileId,
      selectedFileIds: importedNodes.map((node) => node.id),
    }));
  },
  async importSnapshot(file) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      return false;
    }

    if (!isDesktopSnapshot(parsed)) {
      return false;
    }

    await enqueuePersistence(() => restoreSnapshot(parsed));
    set(normalizeHydratedState({
      files: parsed.files,
      notifications: parsed.notifications,
      theme: parsed.theme,
      windows: parsed.windows,
    }));
    return true;
  },
  async resetWorkspace() {
    await enqueuePersistence(() => resetStorage());
    const [files, notifications, theme, windows] = await Promise.all([
      loadFiles(),
      loadNotifications(),
      loadThemePreference(),
      loadSession(),
    ]);
    set(normalizeHydratedState({ files, notifications, theme, windows }));
  },
  async pushNotification(item) {
    const next: NotificationItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...item,
    };
    await saveNotification(next);
    set((state) => ({ notifications: [next, ...state.notifications].slice(0, 8) }));
  },
  async clearNotifications() {
    await clearNotificationHistory();
    set({ notifications: [] });
  },
}));
