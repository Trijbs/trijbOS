import { create } from "zustand";
import { appDefinitions } from "./apps";
import { isProtectedFileNode } from "./filesystem-roots";
import { isDesktopSnapshot, readBrowserFile } from "./import-utils";
import { getFileTargetApp } from "./file-utils";
import {
  applyLayoutPresetState,
  builtinLayoutPresets,
  createLayoutPresetFromWindows,
  getAllLayoutPresets,
  type LayoutPresetId,
} from "./layout-presets";
import { toggleLauncherState, toggleNotificationsState } from "./shell-state";
import {
  clearNotificationHistory,
  deleteNotification,
  deleteFile,
  ensureStorageReady,
  loadFiles,
  loadLayoutPresets,
  loadNotifications,
  loadSession,
  loadThemePreference,
  loadWorkspaceState,
  resetStorage,
  restoreSnapshot,
  saveFile,
  saveLayoutPresets,
  saveNotification,
  saveSession,
  saveThemePreference,
  saveWorkspaceState,
} from "./storage";
import {
  focusWindowState,
  getTopWindow,
  launchAppWindowState,
  maximizeWindowState,
  minimizeWindowState,
  snapWindowState,
  toggleTaskbarWindowState,
  updateWindowBoundsState,
} from "./window-state";
import type {
  AppId,
  FileNode,
  LayoutPreset,
  LaunchContext,
  NotificationItem,
  ThemePreference,
  WindowBounds,
  WindowState,
  WorkspaceState,
} from "./types";

type HydratedPayload = {
  files: FileNode[];
  layoutPresets: LayoutPreset[];
  notifications: NotificationItem[];
  theme: ThemePreference;
  workspace: WorkspaceState;
  windows: WindowState[];
};

function normalizeWindows(windows: WindowState[]) {
  return windows.map((item) => ({
    ...item,
    snap: item.snap ?? null,
  }));
}

type SystemState = {
  hydrated: boolean;
  launcherOpen: boolean;
  notificationsOpen: boolean;
  activeDirectoryId: string | null;
  selectedFileId: string | null;
  selectedFileIds: string[];
  theme: ThemePreference;
  files: FileNode[];
  layoutPresets: LayoutPreset[];
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
  snapWindow: (id: string, snap: "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right") => void;
  snapTopWindow: (snap: "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right") => void;
  applyLayoutPreset: (presetId: LayoutPresetId) => void;
  saveCurrentLayoutPreset: () => Promise<boolean>;
  renameLayoutPreset: (presetId: LayoutPresetId, name: string) => Promise<boolean>;
  deleteLayoutPreset: (presetId: LayoutPresetId) => Promise<boolean>;
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
  restoreFiles: (fileIds: string[]) => Promise<void>;
  emptyTrash: () => Promise<void>;
  importBrowserFiles: (files: FileList, parentId?: string | null) => Promise<void>;
  importSnapshot: (file: File) => Promise<boolean>;
  resetWorkspace: () => Promise<void>;
  pushNotification: (item: Omit<NotificationItem, "id" | "createdAt">) => Promise<void>;
  clearNotifications: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
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
    activeDirectoryId: payload.workspace.activeDirectoryId ?? "desktop",
    files: payload.files,
    hydrated: true,
    layoutPresets: payload.layoutPresets,
    launcherOpen: false,
    notifications: payload.notifications,
    notificationsOpen: false,
    selectedFileId: payload.workspace.selectedFileIds[0] ?? null,
    selectedFileIds: payload.workspace.selectedFileIds,
    theme: payload.theme,
    windows: normalizeWindows(payload.windows),
  };
}

function persistWorkspaceState(activeDirectoryId: string | null, selectedFileIds: string[]) {
  void enqueuePersistence(() =>
    saveWorkspaceState({
      activeDirectoryId,
      selectedFileIds,
    }),
  );
}

function markNotificationsReadState(notifications: NotificationItem[]) {
  const unread = notifications.filter((item) => !item.readAt);
  if (unread.length === 0) {
    return notifications;
  }

  const readAt = new Date().toISOString();
  return notifications.map((item) => (item.readAt ? item : { ...item, readAt }));
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
  layoutPresets: [],
  windows: [],
  notifications: [],
  async hydrate() {
    await ensureStorageReady();
    const [workspace, files, layoutPresets, notifications, theme, windows] = await Promise.all([
      loadWorkspaceState(),
      loadFiles(),
      loadLayoutPresets(),
      loadNotifications(),
      loadThemePreference(),
      loadSession(),
    ]);
    set(normalizeHydratedState({
      files,
      layoutPresets,
      notifications,
      theme,
      windows,
      workspace,
    }));
  },
  toggleLauncher(forced) {
    set((state) => toggleLauncherState(state, forced));
  },
  toggleNotifications(forced) {
    set((state) => {
      const nextState = toggleNotificationsState(state, forced);
      if (nextState.notificationsOpen) {
        const notifications = markNotificationsReadState(state.notifications);
        void Promise.all(notifications.map(async (item) => saveNotification(item)));
        return {
          ...nextState,
          notifications,
        };
      }
      return nextState;
    });
  },
  setActiveDirectory(directoryId) {
    set((state) => {
      persistWorkspaceState(directoryId, state.selectedFileIds);
      return { activeDirectoryId: directoryId };
    });
  },
  setSelectedFiles(fileIds) {
    set((state) => {
      persistWorkspaceState(state.activeDirectoryId, fileIds);
      return { selectedFileIds: fileIds, selectedFileId: fileIds[0] ?? null };
    });
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
    persistWorkspaceState(nextDirectoryId, [fileId]);

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
  snapWindow(id, snap) {
    set((state) => {
      const windows = snapWindowState(state.windows, id, snap);
      withPersistedWindows(windows);
      return { windows };
    });
  },
  snapTopWindow(snap) {
    const topWindow = getTopWindow(get().windows);
    if (!topWindow) {
      return;
    }
    get().snapWindow(topWindow.id, snap);
  },
  applyLayoutPreset(presetId) {
    set((state) => {
      const windows = applyLayoutPresetState(
        state.windows,
        getAllLayoutPresets(state.layoutPresets),
        presetId,
      );
      withPersistedWindows(windows);
      return { windows };
    });
  },
  async saveCurrentLayoutPreset() {
    const { layoutPresets, windows } = get();
    const nextPreset = createLayoutPresetFromWindows(windows, layoutPresets);
    if (!nextPreset) {
      return false;
    }

    const nextPresets = [...layoutPresets, nextPreset];
    set({ layoutPresets: nextPresets });
    await enqueuePersistence(() => saveLayoutPresets(nextPresets));
    return true;
  },
  async renameLayoutPreset(presetId, name) {
    const trimmedName = name.trim();
    if (!trimmedName || !presetId.startsWith("custom-")) {
      return false;
    }

    const nextPresets = get().layoutPresets.map((preset) =>
      preset.id === presetId ? { ...preset, name: trimmedName } : preset,
    );
    set({ layoutPresets: nextPresets });
    await enqueuePersistence(() => saveLayoutPresets(nextPresets));
    return true;
  },
  async deleteLayoutPreset(presetId) {
    if (!presetId.startsWith("custom-")) {
      return false;
    }

    const nextPresets = get().layoutPresets.filter((preset) => preset.id !== presetId);
    set({ layoutPresets: nextPresets });
    await enqueuePersistence(() => saveLayoutPresets(nextPresets));
    return true;
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
      trashedFromId: null,
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
    persistWorkspaceState(get().activeDirectoryId, [node.id]);
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
    const target = get().files.find((item) => item.id === id);
    if (!target) {
      return;
    }

    if (target.parentId === "trash") {
      const nextSelectedFileIds = get().selectedFileIds.filter((fileId) => fileId !== id);
      await deleteFile(id);
      set((state) => ({
        files: state.files.filter((item) => item.id !== id),
        selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
        selectedFileIds: state.selectedFileIds.filter((fileId) => fileId !== id),
      }));
      persistWorkspaceState(get().activeDirectoryId, nextSelectedFileIds);
      return;
    }

    const node = {
      ...target,
      parentId: "trash",
      trashedFromId: target.parentId ?? "desktop",
      updatedAt: new Date().toISOString(),
    };
    await saveFile(node);
    const nextSelectedFileIds = get().selectedFileIds.filter((fileId) => fileId !== id);
    set((state) => ({
      files: state.files.map((item) => (item.id === id ? node : item)),
      selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
      selectedFileIds: state.selectedFileIds.filter((fileId) => fileId !== id),
    }));
    persistWorkspaceState(get().activeDirectoryId, nextSelectedFileIds);
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
          trashedFromId: parentId === "trash" ? item.parentId ?? "desktop" : null,
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
    persistWorkspaceState(get().activeDirectoryId, fileIds);
  },
  async restoreFiles(fileIds) {
    const timestamp = new Date().toISOString();
    const idSet = new Set(fileIds);
    const nextFiles = await Promise.all(
      get().files.map(async (item) => {
        if (!idSet.has(item.id) || item.parentId !== "trash") {
          return item;
        }
        const nextItem = {
          ...item,
          parentId: item.trashedFromId ?? "desktop",
          trashedFromId: null,
          updatedAt: timestamp,
        };
        await saveFile(nextItem);
        return nextItem;
      }),
    );
    set({
      files: nextFiles,
      selectedFileId: null,
      selectedFileIds: [],
    });
    persistWorkspaceState(get().activeDirectoryId, []);
  },
  async emptyTrash() {
    const trashFileIds = get().files
      .filter((item) => item.parentId === "trash" && !isProtectedFileNode(item.id))
      .map((item) => item.id);
    const nextSelectedFileIds = get().selectedFileIds.filter((fileId) => !trashFileIds.includes(fileId));

    await Promise.all(trashFileIds.map(async (id) => deleteFile(id)));
    set((state) => ({
      files: state.files.filter((item) => !trashFileIds.includes(item.id)),
      selectedFileId: trashFileIds.includes(state.selectedFileId ?? "") ? null : state.selectedFileId,
      selectedFileIds: state.selectedFileIds.filter((fileId) => !trashFileIds.includes(fileId)),
    }));
    persistWorkspaceState(get().activeDirectoryId, nextSelectedFileIds);
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
    persistWorkspaceState(get().activeDirectoryId, importedNodes.map((node) => node.id));
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
      layoutPresets: parsed.layoutPresets ?? [],
      notifications: parsed.notifications,
      theme: parsed.theme,
      workspace: parsed.workspace ?? { activeDirectoryId: "desktop", selectedFileIds: [] },
      windows: parsed.windows,
    }));
    return true;
  },
  async resetWorkspace() {
    await enqueuePersistence(() => resetStorage());
    const [layoutPresets, nextWorkspace, nextFiles, nextNotifications, nextTheme, nextWindows] = await Promise.all([
      loadLayoutPresets(),
      loadWorkspaceState(),
      loadFiles(),
      loadNotifications(),
      loadThemePreference(),
      loadSession(),
    ]);
    set(normalizeHydratedState({
      files: nextFiles,
      layoutPresets,
      notifications: nextNotifications,
      theme: nextTheme,
      windows: nextWindows,
      workspace: nextWorkspace,
    }));
  },
  async pushNotification(item) {
    const next: NotificationItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      readAt: null,
      ...item,
    };
    await saveNotification(next);
    set((state) => ({ notifications: [next, ...state.notifications].slice(0, 8) }));
  },
  async clearNotifications() {
    await clearNotificationHistory();
    set({ notifications: [] });
  },
  async dismissNotification(id) {
    await deleteNotification(id);
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    }));
  },
  async markNotificationsRead() {
    const nextNotifications = markNotificationsReadState(get().notifications);
    if (nextNotifications === get().notifications) {
      return;
    }

    set({ notifications: nextNotifications });
    await Promise.all(nextNotifications.map(async (item) => saveNotification(item)));
  },
}));
