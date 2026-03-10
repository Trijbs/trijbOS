import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({
  clearNotificationHistory: vi.fn(async () => undefined),
  deleteFile: vi.fn(async () => undefined),
  ensureStorageReady: vi.fn(async () => undefined),
  loadFiles: vi.fn(async () => []),
  loadNotifications: vi.fn(async () => []),
  loadSession: vi.fn(async () => []),
  loadThemePreference: vi.fn(async () => ({
    mode: "system" as const,
    accent: "#7bf7bf",
    wallpaper: "wallpaper",
  })),
  resetStorage: vi.fn(async () => undefined),
  restoreSnapshot: vi.fn(async () => undefined),
  saveFile: vi.fn(async () => undefined),
  saveNotification: vi.fn(async () => undefined),
  saveSession: vi.fn(async () => undefined),
  saveThemePreference: vi.fn(async () => undefined),
}));

vi.mock("./storage", () => storageMocks);

describe("system store", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens folders by navigating into them", async () => {
    const { useSystemStore } = await import("./system-store");

    useSystemStore.setState({
      files: [
        {
          id: "desktop",
          name: "Desktop",
          parentId: null,
          type: "folder",
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
        {
          id: "documents",
          name: "Documents",
          parentId: "desktop",
          type: "folder",
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeDirectoryId: "desktop",
      windows: [],
      selectedFileId: null,
      selectedFileIds: [],
    });

    useSystemStore.getState().openFile("documents");

    const state = useSystemStore.getState();
    expect(state.activeDirectoryId).toBe("documents");
    expect(state.selectedFileId).toBe("documents");
    expect(state.windows.at(-1)?.appId).toBe("file-explorer");
  });

  it("returns false for malformed snapshot JSON", async () => {
    const { useSystemStore } = await import("./system-store");

    const badFile = new File(["not-json"], "broken.json", { type: "application/json" });
    const result = await useSystemStore.getState().importSnapshot(badFile);

    expect(result).toBe(false);
    expect(storageMocks.restoreSnapshot).not.toHaveBeenCalled();
  });

  it("selects all newly imported browser files", async () => {
    const { useSystemStore } = await import("./system-store");

    useSystemStore.setState({
      activeDirectoryId: "downloads",
      files: [],
      selectedFileId: null,
      selectedFileIds: [],
    });

    const fileList = {
      0: new File(["alpha"], "alpha.txt", { type: "text/plain" }),
      1: new File(["beta"], "beta.txt", { type: "text/plain" }),
      length: 2,
      item(index: number) {
        return this[index as 0 | 1] ?? null;
      },
    } as unknown as FileList;

    await useSystemStore.getState().importBrowserFiles(fileList);

    const state = useSystemStore.getState();
    expect(state.selectedFileIds).toHaveLength(2);
    expect(state.selectedFileId).toBe(state.selectedFileIds[1]);
    expect(storageMocks.saveFile).toHaveBeenCalledTimes(2);
  });

  it("persists session changes after launching a window", async () => {
    vi.useFakeTimers();
    const { useSystemStore } = await import("./system-store");

    useSystemStore.setState({
      windows: [],
      selectedFileId: null,
      selectedFileIds: [],
    });

    useSystemStore.getState().launchApp("settings");
    await vi.runAllTimersAsync();

    expect(useSystemStore.getState().windows).toHaveLength(1);
    expect(storageMocks.saveSession).toHaveBeenCalledTimes(1);
    expect(storageMocks.saveSession).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          appId: "settings",
          minimized: false,
        }),
      ]),
    );
  });

  it("opens the launcher as an exclusive overlay", async () => {
    const { useSystemStore } = await import("./system-store");

    useSystemStore.setState({
      launcherOpen: false,
      notificationsOpen: true,
    });

    useSystemStore.getState().toggleLauncher();

    expect(useSystemStore.getState()).toMatchObject({
      launcherOpen: true,
      notificationsOpen: false,
    });
  });

  it("opens notifications as an exclusive overlay", async () => {
    const { useSystemStore } = await import("./system-store");

    useSystemStore.setState({
      launcherOpen: true,
      notificationsOpen: false,
    });

    useSystemStore.getState().toggleNotifications();

    expect(useSystemStore.getState()).toMatchObject({
      launcherOpen: false,
      notificationsOpen: true,
    });
  });
});
