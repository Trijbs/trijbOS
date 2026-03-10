import { buildDesktopEntries } from "../desktop-entries";
import type { FileNode } from "../types";

type DesktopShortcutsProps = {
  files: FileNode[];
  launchApp: (appId: "file-explorer" | "notes" | "calculator" | "media-viewer" | "terminal" | "settings") => void;
  openFile: (fileId: string) => void;
};

export function DesktopShortcuts({ files, launchApp, openFile }: DesktopShortcutsProps) {
  const entries = buildDesktopEntries(files);

  return (
    <section className="desktop-shortcuts">
      {entries.map((entry) => {
        const Icon = entry.icon;
        return (
          <button
            className="desktop-shortcut"
            key={`${entry.kind}-${entry.id}`}
            onDoubleClick={() => {
              if (entry.kind === "app") {
                launchApp(entry.id);
                return;
              }
              openFile(entry.id);
            }}
            onClick={(event) => event.stopPropagation()}
            type="button"
          >
            <span className="desktop-shortcut-icon">
              <Icon size={20} />
            </span>
            <span>{entry.label}</span>
          </button>
        );
      })}
    </section>
  );
}
