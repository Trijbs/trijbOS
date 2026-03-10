import { describe, expect, it } from "vitest";
import { getKeyboardShortcutCommand } from "./keyboard-shortcuts";

describe("keyboard shortcuts", () => {
  it("opens the launcher with command/control + k", () => {
    expect(
      getKeyboardShortcutCommand({
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        key: "k",
      }),
    ).toBe("open-launcher");
  });

  it("opens settings with command/control + comma", () => {
    expect(
      getKeyboardShortcutCommand({
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
        key: ",",
      }),
    ).toBe("open-settings");
  });

  it("prioritizes maximize over minimize for command/control + shift + m", () => {
    expect(
      getKeyboardShortcutCommand({
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        key: "m",
      }),
    ).toBe("maximize-top-window");
  });

  it("minimizes the top window with command/control + m", () => {
    expect(
      getKeyboardShortcutCommand({
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
        key: "m",
      }),
    ).toBe("minimize-top-window");
  });

  it("dismisses overlays with escape without modifiers", () => {
    expect(
      getKeyboardShortcutCommand({
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        key: "Escape",
      }),
    ).toBe("dismiss-overlays");
  });

  it("ignores unrelated keys", () => {
    expect(
      getKeyboardShortcutCommand({
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        key: "a",
      }),
    ).toBeNull();
  });
});
