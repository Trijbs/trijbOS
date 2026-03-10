import { useEffect, useMemo, useState } from "react";
import { appDefinitions } from "../apps";
import { useSystemStore } from "../system-store";

type LauncherResult =
  | { id: string; kind: "app"; label: string; detail: string }
  | { id: string; kind: "file"; label: string; detail: string };

export function Launcher() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const launchApp = useSystemStore((state) => state.launchApp);
  const files = useSystemStore((state) => state.files);
  const openFile = useSystemStore((state) => state.openFile);

  const results = useMemo<LauncherResult[]>(() => {
    const normalized = query.trim().toLowerCase();
    const appResults = Object.values(appDefinitions)
      .filter((app) =>
        normalized.length === 0
          ? true
          : `${app.title} ${app.description} ${app.keywords.join(" ")}`
              .toLowerCase()
              .includes(normalized),
      )
      .map((app) => ({ id: app.id, kind: "app" as const, label: app.title, detail: app.description }));

    const fileResults = files
      .filter((node) => (normalized.length === 0 ? false : node.name.toLowerCase().includes(normalized)))
      .slice(0, 4)
      .map((node) => ({
        id: node.id,
        kind: "file" as const,
        label: node.name,
        detail: node.parentId ?? "root",
      }));

    return [...appResults, ...fileResults].slice(0, 8);
  }, [files, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const activateResult = (result: LauncherResult | undefined) => {
    if (!result) {
      return;
    }
    if (result.kind === "app") {
      launchApp(result.id);
      return;
    }
    openFile(result.id);
  };

  return (
    <section aria-label="Launcher" className="launcher-panel">
      <input
        aria-activedescendant={results[activeIndex] ? `launcher-result-${results[activeIndex].kind}-${results[activeIndex].id}` : undefined}
        aria-autocomplete="list"
        aria-controls="launcher-results"
        aria-expanded="true"
        aria-label="Launcher search"
        aria-haspopup="listbox"
        autoFocus
        className="launcher-input"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
          }
          if (event.key === "Enter") {
            event.preventDefault();
            activateResult(results[activeIndex]);
          }
        }}
        placeholder="Search apps, files, settings"
        role="combobox"
        value={query}
      />
      <div aria-label="Launcher results" className="launcher-results" id="launcher-results" role="listbox">
        {results.map((result, index) => (
          <button
            aria-selected={index === activeIndex}
            className={`launcher-result ${index === activeIndex ? "is-active" : ""}`}
            id={`launcher-result-${result.kind}-${result.id}`}
            key={`${result.kind}-${result.id}`}
            onClick={() => activateResult(result)}
            onMouseEnter={() => setActiveIndex(index)}
            role="option"
            type="button"
          >
            <span>{result.label}</span>
            <small>{result.detail}</small>
          </button>
        ))}
        {results.length === 0 ? <div className="launcher-empty">No matches for this query.</div> : null}
      </div>
    </section>
  );
}
