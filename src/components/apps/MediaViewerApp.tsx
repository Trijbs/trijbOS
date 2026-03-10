import { useSystemStore } from "../../system-store";

const wallpapers = [
  "radial-gradient(circle at 20% 20%, rgba(123, 247, 191, 0.35), transparent 28%), radial-gradient(circle at 80% 10%, rgba(90, 140, 255, 0.28), transparent 30%), linear-gradient(135deg, #0f1720 0%, #1d2834 52%, #28364d 100%)",
  "radial-gradient(circle at 15% 15%, rgba(255, 196, 125, 0.35), transparent 20%), radial-gradient(circle at 80% 25%, rgba(255, 110, 110, 0.2), transparent 25%), linear-gradient(145deg, #241820 0%, #42293f 55%, #8a5b54 100%)",
  "radial-gradient(circle at 30% 30%, rgba(116, 215, 255, 0.26), transparent 24%), radial-gradient(circle at 70% 20%, rgba(144, 255, 208, 0.2), transparent 24%), linear-gradient(135deg, #08141c 0%, #163040 50%, #284a56 100%)",
];

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
        {wallpapers.map((wallpaper) => (
          <button
            className={`wallpaper-tile ${theme.wallpaper === wallpaper ? "is-active" : ""}`}
            key={wallpaper}
            onClick={() => void updateTheme({ wallpaper })}
            style={{ background: wallpaper }}
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
