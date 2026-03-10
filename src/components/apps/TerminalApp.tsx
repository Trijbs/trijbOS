import { useMemo } from "react";
import { useSystemStore } from "../../system-store";

export function TerminalApp() {
  const files = useSystemStore((state) => state.files);
  const windows = useSystemStore((state) => state.windows);
  const theme = useSystemStore((state) => state.theme);
  const notifications = useSystemStore((state) => state.notifications);

  const lines = useMemo(
    () => [
      "trijbOS@desktop:~$ system",
      `theme.mode=${theme.mode} accent=${theme.accent}`,
      `files.total=${files.length} windows.open=${windows.filter((item) => !item.minimized).length}`,
      `notifications.recent=${notifications.length}`,
      "trijbOS@desktop:~$ help",
      "Available commands: system, apps, storage, roadmap",
      "trijbOS@desktop:~$ roadmap",
      "MVP focus: shell > windows > taskbar > storage > apps > QA.",
    ],
    [files.length, notifications.length, theme.accent, theme.mode, windows],
  );

  return (
    <div className="app-pane terminal-app">
      {lines.map((line) => (
        <div className="terminal-line" key={line}>
          {line}
        </div>
      ))}
    </div>
  );
}
