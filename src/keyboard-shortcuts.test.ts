import { describe, expect, it } from "vitest";
import { getKeyboardShortcutCommand } from "./keyboard-shortcuts";

describe("keyboard shortcuts", () => {
  it("opens the launcher with command/control + k", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: false,
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
        altKey: false,
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
        altKey: false,
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
        altKey: false,
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
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        key: "Escape",
      }),
    ).toBe("dismiss-overlays");
  });

  it("snaps the top window left with command/control + alt + left", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        key: "ArrowLeft",
      }),
    ).toBe("snap-top-window-left");
  });

  it("snaps the top window right with command/control + alt + right", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: true,
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
        key: "ArrowRight",
      }),
    ).toBe("snap-top-window-right");
  });

  it("snaps the top window into the top-left quarter with command/control + alt + shift + left", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        key: "ArrowLeft",
      }),
    ).toBe("snap-top-window-top-left");
  });

  it("snaps the top window into the top-right quarter with command/control + alt + shift + right", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: true,
        ctrlKey: false,
        metaKey: true,
        shiftKey: true,
        key: "ArrowRight",
      }),
    ).toBe("snap-top-window-top-right");
  });

  it("snaps the top window into the bottom-left quarter with command/control + alt + shift + up", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        key: "ArrowUp",
      }),
    ).toBe("snap-top-window-bottom-left");
  });

  it("snaps the top window into the bottom-right quarter with command/control + alt + shift + down", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: true,
        ctrlKey: false,
        metaKey: true,
        shiftKey: true,
        key: "ArrowDown",
      }),
    ).toBe("snap-top-window-bottom-right");
  });

  it("ignores unrelated keys", () => {
    expect(
      getKeyboardShortcutCommand({
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        key: "a",
      }),
    ).toBeNull();
  });
});
