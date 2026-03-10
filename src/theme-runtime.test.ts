import { describe, expect, it } from "vitest";
import { applyThemeToDocument, resolveThemeMode } from "./theme-runtime";

describe("theme runtime", () => {
  it("resolves system mode to dark when the environment prefers dark", () => {
    expect(resolveThemeMode("system", true)).toBe("dark");
  });

  it("resolves system mode to light when the environment does not prefer dark", () => {
    expect(resolveThemeMode("system", false)).toBe("light");
  });

  it("preserves explicit light and dark modes", () => {
    expect(resolveThemeMode("light", true)).toBe("light");
    expect(resolveThemeMode("dark", false)).toBe("dark");
  });

  it("applies theme values to the root element", () => {
    const styleValues = new Map<string, string>();
    const root = {
      dataset: {} as DOMStringMap,
      style: {
        getPropertyValue(name: string) {
          return styleValues.get(name) ?? "";
        },
        setProperty(name: string, value: string) {
          styleValues.set(name, value);
        },
      },
    } as unknown as HTMLElement;

    applyThemeToDocument(
      {
        mode: "system",
        accent: "#ff00aa",
        wallpaper: "linear-gradient(red, blue)",
      },
      root,
      true,
    );

    expect(root.dataset.theme).toBe("dark");
    expect(root.style.getPropertyValue("--accent")).toBe("#ff00aa");
    expect(root.style.getPropertyValue("--wallpaper")).toBe("linear-gradient(red, blue)");
  });
});
