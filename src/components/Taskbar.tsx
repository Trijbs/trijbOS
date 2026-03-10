import { Bell, LayoutGrid, Search, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { appDefinitions, pinnedApps } from "../apps";
import { useSystemStore } from "../system-store";

export function Taskbar() {
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
  const toggleTaskbarWindow = useSystemStore((state) => state.toggleTaskbarWindow);
  const windows = useSystemStore((state) => state.windows);
  const notifications = useSystemStore((state) => state.notifications);

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
        <button aria-label="Open settings" className="taskbar-button" onClick={() => launchApp("settings")} type="button">
          <Settings2 size={18} />
        </button>
        <button aria-label="Notifications" className="taskbar-button" onClick={() => toggleNotifications()} type="button">
          <Bell size={18} />
          {notifications.length > 0 ? <span className="taskbar-badge">{notifications.length}</span> : null}
        </button>
        <div className="taskbar-clock">{time}</div>
      </div>
    </footer>
  );
}
