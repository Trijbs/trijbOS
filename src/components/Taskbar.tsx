import { Bell, LayoutGrid, Search, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { appDefinitions, pinnedApps } from "../apps";
import { getAllLayoutPresets, isCustomLayoutPreset } from "../layout-presets";
import { useSystemStore } from "../system-store";
import { formatThemeModeLabel, getActiveDirectoryLabel } from "../taskbar-utils";

export function Taskbar() {
  const [layoutsOpen, setLayoutsOpen] = useState(false);
  const [time, setTime] = useState(() =>
    new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  );
  const launcherOpen = useSystemStore((state) => state.launcherOpen);
  const toggleLauncher = useSystemStore((state) => state.toggleLauncher);
  const toggleNotifications = useSystemStore((state) => state.toggleNotifications);
  const launchApp = useSystemStore((state) => state.launchApp);
  const applyLayoutPreset = useSystemStore((state) => state.applyLayoutPreset);
  const userLayoutPresets = useSystemStore((state) => state.layoutPresets);
  const saveCurrentLayoutPreset = useSystemStore((state) => state.saveCurrentLayoutPreset);
  const deleteLayoutPreset = useSystemStore((state) => state.deleteLayoutPreset);
  const toggleTaskbarWindow = useSystemStore((state) => state.toggleTaskbarWindow);
  const windows = useSystemStore((state) => state.windows);
  const notifications = useSystemStore((state) => state.notifications);
  const theme = useSystemStore((state) => state.theme);
  const files = useSystemStore((state) => state.files);
  const activeDirectoryId = useSystemStore((state) => state.activeDirectoryId);
  const setActiveDirectory = useSystemStore((state) => state.setActiveDirectory);
  const unreadCount = notifications.filter((item) => !item.readAt).length;
  const trashCount = files.filter((item) => item.parentId === "trash").length;
  const activeDirectoryLabel = getActiveDirectoryLabel(files, activeDirectoryId);

  const runningIds = new Set(windows.map((item) => item.appId));
  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(
        new Intl.DateTimeFormat([], {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <footer className="taskbar">
      <div className="taskbar-group">
        <button
          aria-label="Open launcher"
          className={`taskbar-button ${launcherOpen ? "is-active" : ""}`}
          onClick={() => toggleLauncher()}
          type="button"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          aria-label="Search"
          className="taskbar-button"
          onClick={() => toggleLauncher(true)}
          type="button"
        >
          <Search size={18} />
        </button>
      </div>
      <div className="taskbar-group taskbar-apps">
        {pinnedApps.map((appId) => {
          const app = appDefinitions[appId];
          const Icon = app.icon;
          const activeWindow = windows.find((item) => item.appId === appId);
          return (
            <button
              className={`taskbar-app ${runningIds.has(appId) ? "is-running" : ""}`}
              key={appId}
              onClick={() => (activeWindow ? toggleTaskbarWindow(appId) : launchApp(appId))}
              type="button"
            >
              <Icon size={18} />
              <span>{app.title}</span>
            </button>
          );
        })}
      </div>
      <div className="taskbar-group">
        <div className="taskbar-layouts">
          <button
            aria-expanded={layoutsOpen}
            aria-label="Open layouts"
            className={`taskbar-button ${layoutsOpen ? "is-active" : ""}`}
            onClick={() => setLayoutsOpen((current) => !current)}
            type="button"
          >
            <LayoutGrid size={18} />
          </button>
          {layoutsOpen ? (
            <div aria-label="Layouts" className="taskbar-layouts-panel">
              {getAllLayoutPresets(userLayoutPresets).map((preset) => (
                <div className="taskbar-layout-entry" key={preset.id}>
                  <button
                    aria-label={`Apply ${preset.name} from taskbar`}
                    onClick={() => {
                      applyLayoutPreset(preset.id);
                      setLayoutsOpen(false);
                    }}
                    type="button"
                  >
                    <strong>{preset.name}</strong>
                    <span>{preset.description}</span>
                  </button>
                  {isCustomLayoutPreset(preset.id) ? (
                    <button
                      aria-label={`Delete ${preset.name} from taskbar`}
                      className="taskbar-layout-delete"
                      onClick={() => void deleteLayoutPreset(preset.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                aria-label="Save current layout from taskbar"
                onClick={() => {
                  void saveCurrentLayoutPreset();
                  setLayoutsOpen(false);
                }}
                type="button"
              >
                <strong>Save Current Layout</strong>
                <span>Store the current tiled workspace for later reuse.</span>
              </button>
            </div>
          ) : null}
        </div>
        <button
          aria-label={`Theme mode ${formatThemeModeLabel(theme.mode)}`}
          className="taskbar-status"
          onClick={() => launchApp("settings")}
          type="button"
        >
          <span className="taskbar-status-label">Theme</span>
          <span>{formatThemeModeLabel(theme.mode)}</span>
        </button>
        <button
          aria-label={`Current location ${activeDirectoryLabel}`}
          className="taskbar-status"
          onClick={() => {
            launchApp("file-explorer");
          }}
          type="button"
        >
          <span className="taskbar-status-label">Location</span>
          <span>{activeDirectoryLabel}</span>
        </button>
        {trashCount > 0 ? (
          <button
            aria-label={`Trash contains ${trashCount} item${trashCount === 1 ? "" : "s"}`}
            className="taskbar-status"
            onClick={() => {
              setActiveDirectory("trash");
              launchApp("file-explorer");
            }}
            type="button"
          >
            <span className="taskbar-status-label">Trash</span>
            <span>{trashCount}</span>
          </button>
        ) : null}
        <button aria-label="Open settings" className="taskbar-button" onClick={() => launchApp("settings")} type="button">
          <Settings2 size={18} />
        </button>
        <button aria-label="Notifications" className="taskbar-button" onClick={() => toggleNotifications()} type="button">
          <Bell size={18} />
          {unreadCount > 0 ? <span className="taskbar-badge">{unreadCount}</span> : null}
        </button>
        <div className="taskbar-clock">{time}</div>
      </div>
    </footer>
  );
}
