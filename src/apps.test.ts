import { describe, expect, it } from "vitest";
import { appDefinitions, pinnedApps } from "./apps";

describe("app registry", () => {
  it("registers the required MVP apps", () => {
    expect(Object.keys(appDefinitions).sort()).toEqual([
      "calculator",
      "file-explorer",
      "media-viewer",
      "notes",
      "settings",
      "terminal",
    ]);
  });

  it("pins only valid apps", () => {
    expect(pinnedApps.every((appId) => appId in appDefinitions)).toBe(true);
  });
});
