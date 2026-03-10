import { useRef } from "react";
import { useSystemStore } from "../../system-store";

const accents = ["#7bf7bf", "#ffb86c", "#9b8cff", "#ff7a9f", "#6fd3ff"];

export function SettingsApp() {
  const importRef = useRef<HTMLInputElement | null>(null);
  const theme = useSystemStore((state) => state.theme);
  const files = useSystemStore((state) => state.files);
  const windows = useSystemStore((state) => state.windows);
  const notifications = useSystemStore((state) => state.notifications);
  const importSnapshot = useSystemStore((state) => state.importSnapshot);
  const resetWorkspace = useSystemStore((state) => state.resetWorkspace);
  const updateTheme = useSystemStore((state) => state.updateTheme);
  const pushNotification = useSystemStore((state) => state.pushNotification);

  return (
    <div className="app-pane settings-app">
      <section className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-row">
          <label htmlFor="theme-mode">Color mode</label>
          <select
            id="theme-mode"
            onChange={(event) => void updateTheme({ mode: event.target.value as typeof theme.mode })}
            value={theme.mode}
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div className="accent-grid">
          {accents.map((accent) => (
            <button
              className={`accent-swatch ${theme.accent === accent ? "is-active" : ""}`}
              key={accent}
              onClick={() => void updateTheme({ accent })}
              style={{ background: accent }}
              type="button"
            />
          ))}
        </div>
      </section>
      <section className="settings-section">
        <h3>Desktop</h3>
        <p>Launcher: `Ctrl/Cmd + K`</p>
        <p>Double-click the desktop to open File Explorer.</p>
        <button
          aria-label="Export desktop snapshot"
          onClick={() => {
            const snapshot = JSON.stringify(
              {
                exportedAt: new Date().toISOString(),
                files,
                notifications,
                theme,
                windows,
              },
              null,
              2,
            );
            const blob = new Blob([snapshot], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "trijbos-snapshot.json";
            link.click();
            URL.revokeObjectURL(url);
            void pushNotification({
              title: "Snapshot exported",
              body: "Desktop state was downloaded as JSON.",
              tone: "success",
            });
          }}
          type="button"
        >
          Export desktop snapshot
        </button>
        <button aria-label="Import desktop snapshot" onClick={() => importRef.current?.click()} type="button">
          Import desktop snapshot
        </button>
        <input
          accept="application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            void importSnapshot(file).then((ok) =>
              pushNotification({
                title: ok ? "Snapshot imported" : "Invalid snapshot",
                body: ok
                  ? "Desktop state was restored from JSON."
                  : "The selected file does not match the trijbOS snapshot format.",
                tone: ok ? "success" : "warning",
              }),
            );
            event.target.value = "";
          }}
          ref={importRef}
          type="file"
        />
        <button
          aria-label="Reset workspace"
          onClick={() =>
            void resetWorkspace().then(() =>
              pushNotification({
                title: "Workspace reset",
                body: "Desktop state was restored to the seeded MVP defaults.",
                tone: "warning",
              }),
            )
          }
          type="button"
        >
          Reset workspace
        </button>
      </section>
    </div>
  );
}
