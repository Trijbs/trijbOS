export type KeyboardShortcutInput = {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
};

export type KeyboardShortcutCommand =
  | "open-launcher"
  | "open-settings"
  | "close-top-window"
  | "minimize-top-window"
  | "maximize-top-window"
  | "dismiss-overlays";

export function getKeyboardShortcutCommand(
  input: KeyboardShortcutInput,
): KeyboardShortcutCommand | null {
  const hasCommandModifier = input.metaKey || input.ctrlKey;
  const normalizedKey = input.key.toLowerCase();

  if (input.key === "Escape") {
    return "dismiss-overlays";
  }

  if (!hasCommandModifier) {
    return null;
  }

  if (normalizedKey === "k") {
    return "open-launcher";
  }

  if (input.key === ",") {
    return "open-settings";
  }

  if (normalizedKey === "w") {
    return "close-top-window";
  }

  if (input.shiftKey && normalizedKey === "m") {
    return "maximize-top-window";
  }

  if (normalizedKey === "m") {
    return "minimize-top-window";
  }

  return null;
}
