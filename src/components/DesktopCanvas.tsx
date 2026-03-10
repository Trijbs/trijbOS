import type { ReactNode } from "react";

type DesktopCanvasProps = {
  children: ReactNode;
  onOpenFileExplorer: () => void;
};

export function DesktopCanvas({
  children,
  onOpenFileExplorer,
}: DesktopCanvasProps) {
  return (
    <main
      className="desktop-canvas"
      onDoubleClick={onOpenFileExplorer}
    >
      {children}
    </main>
  );
}
