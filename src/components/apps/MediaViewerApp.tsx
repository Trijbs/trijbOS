import { useSystemStore } from "../../system-store";
import { wallpaperOptions } from "../../theme-options";

export function MediaViewerApp() {
  const updateTheme = useSystemStore((state) => state.updateTheme);
  const theme = useSystemStore((state) => state.theme);
  const files = useSystemStore((state) => state.files);
  const selectedFileId = useSystemStore((state) => state.selectedFileId);
  const openFile = useSystemStore((state) => state.openFile);
  const selectedMedia =
    files.find((item) => item.id === selectedFileId && item.type === "image") ??
    files.find((item) => item.type === "image") ??
    null;

  return (
    <div className="app-pane media-viewer">
      <div
        className="media-stage"
        style={{ background: selectedMedia?.content ?? theme.wallpaper }}
      />
      <div className="media-meta">
        <strong>{selectedMedia?.name ?? "Current wallpaper preview"}</strong>
        <small>
          {selectedMedia
            ? "Selected from the simulated Pictures directory."
            : "Using the active desktop wallpaper."}
        </small>
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
          />
        ))}
      </div>
      <div className="media-library">
        {files
          .filter((item) => item.type === "image")
          .map((item) => (
            <button className="launcher-result" key={item.id} onClick={() => openFile(item.id)} type="button">
              <span>{item.name}</span>
              <small>{item.parentId ?? "root"}</small>
            </button>
          ))}
      </div>
    </div>
  );
}
