import { useEffect, useMemo, useState } from "react";
import { getAllLayoutPresets } from "../layout-presets";
import { buildLauncherResults, type LauncherResult } from "../launcher-utils";
import { useSystemStore } from "../system-store";

export function Launcher() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const launchApp = useSystemStore((state) => state.launchApp);
  const files = useSystemStore((state) => state.files);
  const layoutPresets = useSystemStore((state) => state.layoutPresets);
  const openFile = useSystemStore((state) => state.openFile);
  const applyLayoutPreset = useSystemStore((state) => state.applyLayoutPreset);

  const results = useMemo<LauncherResult[]>(() => {
    return buildLauncherResults(files, query, getAllLayoutPresets(layoutPresets));
  }, [files, layoutPresets, query]);

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
    if (result.kind === "layout") {
      applyLayoutPreset(result.id);
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
        id="launcher-search"
        name="launcher-search"
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
