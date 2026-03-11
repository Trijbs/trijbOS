import { useRef, useState } from "react";
import { getAllLayoutPresets, isCustomLayoutPreset } from "../../layout-presets";
import { useSystemStore } from "../../system-store";
import { accentOptions, wallpaperOptions } from "../../theme-options";

export function SettingsApp() {
  const importRef = useRef<HTMLInputElement | null>(null);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState("");
  const theme = useSystemStore((state) => state.theme);
  const files = useSystemStore((state) => state.files);
  const windows = useSystemStore((state) => state.windows);
  const userLayoutPresets = useSystemStore((state) => state.layoutPresets);
  const notifications = useSystemStore((state) => state.notifications);
  const activeDirectoryId = useSystemStore((state) => state.activeDirectoryId);
  const selectedFileIds = useSystemStore((state) => state.selectedFileIds);
  const importSnapshot = useSystemStore((state) => state.importSnapshot);
  const resetWorkspace = useSystemStore((state) => state.resetWorkspace);
  const updateTheme = useSystemStore((state) => state.updateTheme);
  const pushNotification = useSystemStore((state) => state.pushNotification);
  const applyLayoutPreset = useSystemStore((state) => state.applyLayoutPreset);
  const saveCurrentLayoutPreset = useSystemStore((state) => state.saveCurrentLayoutPreset);
  const renameLayoutPreset = useSystemStore((state) => state.renameLayoutPreset);
  const deleteLayoutPreset = useSystemStore((state) => state.deleteLayoutPreset);
  const togglePinLayoutPreset = useSystemStore((state) => state.togglePinLayoutPreset);

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
          {accentOptions.map((accent) => (
            <button
              aria-label={`Use ${accent.label} accent`}
              className={`accent-swatch ${theme.accent === accent.value ? "is-active" : ""}`}
              key={accent.id}
              onClick={() => void updateTheme({ accent: accent.value })}
              style={{ background: accent.value }}
              type="button"
            >
              <span className="swatch-caption">{accent.label}</span>
            </button>
          ))}
        </div>
        <div className="wallpaper-grid">
          {wallpaperOptions.map((wallpaper) => (
            <button
              aria-label={`Use ${wallpaper.label} wallpaper`}
              className={`wallpaper-tile ${theme.wallpaper === wallpaper.value ? "is-active" : ""}`}
              key={wallpaper.id}
              onClick={() => void updateTheme({ wallpaper: wallpaper.value })}
              style={{ background: wallpaper.value }}
              type="button"
            >
              <span className="swatch-caption">{wallpaper.label}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="settings-section">
        <h3>Desktop</h3>
        <p>Launcher: `Ctrl/Cmd + K`</p>
        <p>Double-click the desktop to open File Explorer.</p>
        <div className="layout-presets">
          <button
            aria-label="Save current layout as preset"
            onClick={() =>
              void saveCurrentLayoutPreset().then((ok) =>
                pushNotification({
                  title: ok ? "Layout saved" : "No layout to save",
                  body: ok
                    ? "Current window arrangement is now available in layouts."
                    : "Arrange and tile at least one visible window before saving a layout.",
                  tone: ok ? "success" : "warning",
                }),
              )
            }
            type="button"
          >
            <strong>Save Current Layout</strong>
            <span>Capture the current tiled/maximized window arrangement.</span>
          </button>
          {getAllLayoutPresets(userLayoutPresets).map((preset) => (
            <div className="layout-preset-card" key={preset.id}>
              <button
                aria-label={`Apply ${preset.name} layout`}
                onClick={() => {
                  applyLayoutPreset(preset.id);
                  void pushNotification({
                    title: "Layout applied",
                    body: `${preset.name} arranged your open apps.`,
                    tone: "success",
                  });
                }}
                type="button"
              >
                <strong>{preset.name}</strong>
                <span>{preset.description}</span>
              </button>
              {isCustomLayoutPreset(preset.id) ? (
                <div className="layout-preset-actions">
                  {editingPresetId === preset.id ? (
                    <>
                      <input
                        aria-label={`Edit ${preset.name} layout name`}
                        autoFocus
                        className="inline-input"
                        onChange={(event) => setEditingPresetName(event.target.value)}
                        value={editingPresetName}
                      />
                      <button
                        aria-label={`Save ${preset.name} layout name`}
                        onClick={() => {
                          void renameLayoutPreset(preset.id, editingPresetName).then((ok) => {
                            if (!ok) {
                              return;
                            }
                            setEditingPresetId(null);
                            setEditingPresetName("");
                          });
                        }}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        aria-label={`Cancel renaming ${preset.name} layout`}
                        onClick={() => {
                          setEditingPresetId(null);
                          setEditingPresetName("");
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        aria-label={`${preset.pinned ? "Unpin" : "Pin"} ${preset.name} layout`}
                        onClick={() => void togglePinLayoutPreset(preset.id)}
                        type="button"
                      >
                        {preset.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        aria-label={`Rename ${preset.name} layout`}
                        onClick={() => {
                          setEditingPresetId(preset.id);
                          setEditingPresetName(preset.name);
                        }}
                        type="button"
                      >
                        Rename
                      </button>
                    </>
                  )}
                  <button
                    aria-label={`Delete ${preset.name} layout`}
                    onClick={() => void deleteLayoutPreset(preset.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <button
          aria-label="Export desktop snapshot"
          onClick={() => {
            const snapshot = JSON.stringify(
              {
                exportedAt: new Date().toISOString(),
                files,
                layoutPresets: userLayoutPresets,
                notifications,
                theme,
                workspace: {
                  activeDirectoryId,
                  selectedFileIds,
                },
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
