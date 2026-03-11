import { useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import { Minus, PanelLeft, PanelRight, Square, X } from "lucide-react";
import { appDefinitions } from "../apps";
import { useSystemStore } from "../system-store";
import { getDragSnapTarget, getSnapBounds } from "../window-snap";

function cycleWindowFocus(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "Tab") {
    return;
  }

  const focusables = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => !item.hasAttribute("hidden"));

  if (focusables.length === 0) {
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;
  const activeIndex = active ? focusables.indexOf(active) : -1;

  if (event.shiftKey && (active === first || active === event.currentTarget)) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (event.shiftKey && activeIndex > 0) {
    event.preventDefault();
    focusables[activeIndex - 1].focus();
    return;
  }

  if (!event.shiftKey && (active === event.currentTarget || active === null)) {
    event.preventDefault();
    first.focus();
    return;
  }

  if (!event.shiftKey && activeIndex >= 0 && activeIndex < focusables.length - 1) {
    event.preventDefault();
    focusables[activeIndex + 1].focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function WindowLayer() {
  const [dragPreview, setDragPreview] = useState<{
    target: "left" | "right";
    windowId: string;
  } | null>(null);
  const windowStateItems = useSystemStore((state) => state.windows);
  const windows = useMemo(
    () =>
      [...windowStateItems]
        .filter((item) => !item.minimized)
        .sort((left, right) => left.zIndex - right.zIndex),
    [windowStateItems],
  );
  const topWindowId = windows.at(-1)?.id ?? null;
  const focusWindow = useSystemStore((state) => state.focusWindow);
  const closeWindow = useSystemStore((state) => state.closeWindow);
  const minimizeWindow = useSystemStore((state) => state.minimizeWindow);
  const maximizeWindow = useSystemStore((state) => state.maximizeWindow);
  const snapWindow = useSystemStore((state) => state.snapWindow);
  const updateWindowBounds = useSystemStore((state) => state.updateWindowBounds);

  return (
    <div className="window-layer">
      {dragPreview ? (
        <div
          className="window-snap-preview"
          style={getSnapBounds(dragPreview.target, window.innerWidth, window.innerHeight)}
        />
      ) : null}
      {windows.map((windowState) => {
        const app = appDefinitions[windowState.appId];
        const Icon = app.icon;
        const Component = app.component;
        const snappedBounds = windowState.snap
          ? getSnapBounds(windowState.snap, window.innerWidth, window.innerHeight)
          : null;
        const bounds = windowState.maximized
          ? { x: 12, y: 12, width: window.innerWidth - 24, height: window.innerHeight - 88 }
          : snappedBounds ?? windowState.bounds;
        const isSnapped = windowState.snap !== null;

        return (
          <Rnd
            bounds="parent"
            className={`window-frame ${topWindowId === windowState.id ? "is-focused" : ""}`}
            disableDragging={windowState.maximized || isSnapped}
            enableResizing={windowState.maximized ? false : app.resizable ?? true}
            key={windowState.id}
            minHeight={app.minHeight ?? 280}
            minWidth={app.minWidth ?? 320}
            onDrag={(_, data) => {
              const target = getDragSnapTarget(data.x, windowState.bounds.width, window.innerWidth);
              setDragPreview(target ? { target, windowId: windowState.id } : null);
            }}
            onDragStart={() => {
              setDragPreview(null);
              focusWindow(windowState.id);
            }}
            onFocus={() => focusWindow(windowState.id)}
            onKeyDown={cycleWindowFocus}
            onDragStop={(_, data) => {
              const target = getDragSnapTarget(data.x, windowState.bounds.width, window.innerWidth);
              setDragPreview(null);
              if (target) {
                snapWindow(windowState.id, target);
                return;
              }
              updateWindowBounds(windowState.id, {
                ...windowState.bounds,
                x: data.x,
                y: data.y,
              });
            }}
            onMouseDown={() => focusWindow(windowState.id)}
            onResizeStop={(_, __, ref, ___, position) =>
              updateWindowBounds(windowState.id, {
                height: Number.parseFloat(ref.style.height),
                width: Number.parseFloat(ref.style.width),
                x: position.x,
                y: position.y,
              })
            }
            position={{ x: bounds.x, y: bounds.y }}
            role="dialog"
            size={{ width: bounds.width, height: bounds.height }}
            style={{ zIndex: windowState.zIndex }}
            aria-label={windowState.title}
            aria-labelledby={`window-title-${windowState.id}`}
            aria-modal={false}
            data-maximized={windowState.maximized}
            data-snap={windowState.snap ?? undefined}
            tabIndex={0}
          >
            <div
              className="window-titlebar"
              id={`window-title-${windowState.id}`}
              onDoubleClick={() => maximizeWindow(windowState.id)}
            >
              <div className="window-title">
                <span className="window-app-icon">
                  <Icon size={16} />
                </span>
                <span>{windowState.title}</span>
              </div>
              <div className="window-controls">
                <button
                  aria-label={`Snap ${windowState.title} left`}
                  aria-pressed={windowState.snap === "left"}
                  onClick={() => snapWindow(windowState.id, "left")}
                  type="button"
                >
                  <PanelLeft size={14} />
                </button>
                <button
                  aria-label={`Snap ${windowState.title} right`}
                  aria-pressed={windowState.snap === "right"}
                  onClick={() => snapWindow(windowState.id, "right")}
                  type="button"
                >
                  <PanelRight size={14} />
                </button>
                <button aria-label={`Minimize ${windowState.title}`} onClick={() => minimizeWindow(windowState.id)} type="button">
                  <Minus size={14} />
                </button>
                <button
                  aria-label={`Maximize ${windowState.title}`}
                  aria-pressed={windowState.maximized}
                  onClick={() => maximizeWindow(windowState.id)}
                  type="button"
                >
                  <Square size={14} />
                </button>
                <button aria-label={`Close ${windowState.title}`} onClick={() => closeWindow(windowState.id)} type="button">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="window-content">
              <Component windowId={windowState.id} />
            </div>
          </Rnd>
        );
      })}
    </div>
  );
}
