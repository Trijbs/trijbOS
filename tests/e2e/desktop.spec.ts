import { expect, test, type Page } from "@playwright/test";

async function openLauncher(page: Page) {
  await page.getByLabel("Open launcher").click();
  await expect(page.getByPlaceholder("Search apps, files, settings")).toBeVisible();
}

async function launchFromLauncher(page: Page, query: string) {
  await openLauncher(page);
  await page.getByPlaceholder("Search apps, files, settings").fill(query);
  await page.keyboard.press("Enter");
}

function commandChord(key: string) {
  return `${process.platform === "darwin" ? "Meta" : "Control"}+${key}`;
}

async function dragWindowTitlebar(
  page: Page,
  title: string,
  moveBy: { x: number; y: number },
) {
  const titlebar = page
    .getByRole("dialog", { name: title })
    .locator(".window-titlebar");
  const box = await titlebar.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + moveBy.x, box.y + box.height / 2 + moveBy.y, {
    steps: 12,
  });
  await page.mouse.up();
}

test("desktop boots and launcher opens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Booting trijbOS...")).not.toBeVisible();
  await expect(page.locator(".taskbar")).toBeVisible();

  await launchFromLauncher(page, "terminal");

  await expect(page.getByText("trijbOS@desktop:~$ system")).toBeVisible();
});

test("launcher supports keyboard result navigation", async ({ page }) => {
  await page.goto("/");
  await openLauncher(page);

  const search = page.getByLabel("Launcher search");
  await search.fill("settings");
  await search.press("ArrowDown");
  await search.press("Enter");

  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
});

test("system shortcut opens settings", async ({ page }) => {
  await page.goto("/");
  await page.locator(".desktop-canvas").click();
  await page.keyboard.press(commandChord(","));
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
});

test("theme mode persists across reload", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "settings");

  const themeMode = page.locator("#theme-mode");
  await expect(themeMode).toBeVisible();
  await themeMode.selectOption("light");

  await page.reload();
  await expect(page.locator(".taskbar")).toBeVisible();

  await launchFromLauncher(page, "settings");
  await expect(page.locator("#theme-mode")).toHaveValue("light");
});

test("file explorer accepts uploaded files", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "file explorer");

  await page.locator('input[type="file"]').setInputFiles({
    name: "playwright-note.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello from e2e"),
  });

  await expect(page.locator(".explorer-row").filter({ hasText: "playwright-note.txt" })).toBeVisible();
});

test("taskbar toggles a running window", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  await expect(page.getByText("trijbOS@desktop:~$ system")).toBeVisible();

  await page.getByRole("contentinfo").getByRole("button", { name: "Terminal" }).click();
  await expect(page.getByText("trijbOS@desktop:~$ system")).not.toBeVisible();

  await page.getByRole("contentinfo").getByRole("button", { name: "Terminal" }).click();
  await expect(page.getByText("trijbOS@desktop:~$ system")).toBeVisible();
});

test("system shortcut closes the active window", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");
  await expect(page.getByRole("dialog", { name: "Terminal" })).toBeVisible();

  await page.keyboard.press(commandChord("w"));
  await expect(page.getByRole("dialog", { name: "Terminal" })).not.toBeVisible();
});

test("system shortcut minimizes the active window", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");
  await expect(page.getByRole("dialog", { name: "Terminal" })).toBeVisible();

  await page.keyboard.press(commandChord("m"));
  await expect(page.getByRole("dialog", { name: "Terminal" })).not.toBeVisible();
});

test("system shortcut toggles maximize on the active window", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await expect(terminalWindow).toBeVisible();

  await page.keyboard.press(`${commandChord("Shift+M")}`);
  await expect(terminalWindow).toBeVisible();
});

test("window snap buttons toggle left and right snapped states", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await terminalWindow.getByRole("button", { name: "Snap Terminal left" }).click();
  await expect(terminalWindow).toHaveAttribute("data-snap", "left");

  await terminalWindow.getByRole("button", { name: "Snap Terminal left" }).click();
  await expect(terminalWindow).not.toHaveAttribute("data-snap", "left");

  await terminalWindow.getByRole("button", { name: "Snap Terminal right" }).click();
  await expect(terminalWindow).toHaveAttribute("data-snap", "right");
});

test("snap assist places another open app into the remaining layout space", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");
  await launchFromLauncher(page, "notes");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  const notesWindow = page.getByRole("dialog", { name: "Notes" });

  await page.getByRole("contentinfo").getByRole("button", { name: "Terminal" }).click();
  await terminalWindow.getByRole("button", { name: "Snap Terminal left" }).click();
  await expect(page.getByLabel("Snap assist")).toBeVisible();
  await page.getByRole("button", { name: "Place Notes in right" }).click();
  await expect(notesWindow).toHaveAttribute("data-snap", "right");
});

test("settings can apply a reusable layout preset", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "settings");

  await page.getByRole("button", { name: "Apply Builder Grid layout" }).click();
  await expect(page.getByRole("dialog", { name: "File Explorer" })).toHaveAttribute("data-snap", "left");
  await expect(page.getByRole("dialog", { name: "Terminal" })).toHaveAttribute("data-snap", "top-right");
  await expect(page.getByRole("dialog", { name: "Notes" })).toHaveAttribute("data-snap", "bottom-right");
});

test("settings can save the current layout as a custom preset", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "settings");

  await page.getByRole("button", { name: "Apply Focus Split layout" }).click();
  await page.getByRole("button", { name: "Save current layout as preset" }).click();

  await launchFromLauncher(page, "custom layout 1");
  await expect(page.getByRole("dialog", { name: "Notes" })).toHaveAttribute("data-snap", "left");
  await expect(page.getByRole("dialog", { name: "Terminal" })).toHaveAttribute("data-snap", "right");
});

test("settings can rename and delete a custom layout preset", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "settings");

  await page.getByRole("button", { name: "Apply Focus Split layout" }).click();
  await page.getByRole("button", { name: "Save current layout as preset" }).click();

  page.once("dialog", (dialog) => dialog.accept("Writing Rig"));
  await page.getByRole("button", { name: "Rename Custom Layout 1 layout" }).click();
  await expect(page.getByRole("button", { name: "Apply Writing Rig layout" })).toBeVisible();

  await page.getByRole("button", { name: "Delete Writing Rig layout" }).click();
  await expect(page.getByRole("button", { name: "Apply Writing Rig layout" })).toHaveCount(0);
});

test("launcher can apply a reusable layout preset", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "builder");

  await expect(page.getByRole("dialog", { name: "File Explorer" })).toHaveAttribute("data-snap", "left");
  await expect(page.getByRole("dialog", { name: "Terminal" })).toHaveAttribute("data-snap", "top-right");
  await expect(page.getByRole("dialog", { name: "Notes" })).toHaveAttribute("data-snap", "bottom-right");
});

test("taskbar can apply a reusable layout preset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open layouts" }).click();
  await expect(page.locator(".taskbar-layouts-panel")).toBeVisible();
  await page.getByRole("button", { name: "Apply Focus Split from taskbar" }).click();

  await expect(page.getByRole("dialog", { name: "Notes" })).toHaveAttribute("data-snap", "left");
  await expect(page.getByRole("dialog", { name: "Terminal" })).toHaveAttribute("data-snap", "right");
});

test("keyboard shortcuts snap the active window left and right", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await page.keyboard.press(`${commandChord("Alt+ArrowLeft")}`);
  await expect(terminalWindow).toHaveAttribute("data-snap", "left");

  await page.keyboard.press(`${commandChord("Alt+ArrowRight")}`);
  await expect(terminalWindow).toHaveAttribute("data-snap", "right");
});

test("keyboard shortcuts quarter-tile the active window", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await page.keyboard.press(`${commandChord("Alt+Shift+ArrowLeft")}`);
  await expect(terminalWindow).toHaveAttribute("data-snap", "top-left");

  await page.keyboard.press(`${commandChord("Alt+Shift+ArrowRight")}`);
  await expect(terminalWindow).toHaveAttribute("data-snap", "top-right");

  await page.keyboard.press(`${commandChord("Alt+Shift+ArrowUp")}`);
  await expect(terminalWindow).toHaveAttribute("data-snap", "bottom-left");

  await page.keyboard.press(`${commandChord("Alt+Shift+ArrowDown")}`);
  await expect(terminalWindow).toHaveAttribute("data-snap", "bottom-right");
});

test("dragging a snapped window releases it back to floating mode", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await terminalWindow.getByRole("button", { name: "Snap Terminal left" }).click();
  await expect(terminalWindow).toHaveAttribute("data-snap", "left");

  await dragWindowTitlebar(page, "Terminal", { x: 340, y: 60 });
  await expect(terminalWindow).not.toHaveAttribute("data-snap", "left");
  await expect(terminalWindow).not.toHaveAttribute("data-snap", "right");
});

test("dragging a window to the screen edge snaps it", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await dragWindowTitlebar(page, "Terminal", { x: -420, y: 0 });
  await expect(terminalWindow).toHaveAttribute("data-snap", "left");
});

test("dragging a window to the top edge maximizes it", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await dragWindowTitlebar(page, "Terminal", { x: 0, y: -220 });
  await expect(terminalWindow).toHaveAttribute("data-maximized", "true");
});

test("dragging a window into the top-left corner quarter tiles it", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await dragWindowTitlebar(page, "Terminal", { x: -420, y: -220 });
  await expect(terminalWindow).toHaveAttribute("data-snap", "top-left");
});

test("dragging a window into the bottom-right corner quarter tiles it", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await dragWindowTitlebar(page, "Terminal", { x: 820, y: 720 });
  await expect(terminalWindow).toHaveAttribute("data-snap", "bottom-right");
});

test("window focus cycles through titlebar controls with tab", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "terminal");

  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });
  await terminalWindow.focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Snap Terminal left" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Snap Terminal right" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Minimize Terminal" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Maximize Terminal" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close Terminal" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Snap Terminal left" })).toBeFocused();
});

test("snapshot export and import restores theme state", async ({ page, browserName }, testInfo) => {
  test.skip(browserName === "webkit", "Download handling is flaky in this environment for this smoke flow.");

  await page.goto("/");
  await launchFromLauncher(page, "settings");

  const themeMode = page.locator("#theme-mode");
  await themeMode.selectOption("light");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export desktop snapshot" }).click();
  const download = await downloadPromise;
  const snapshotPath = testInfo.outputPath("trijbos-snapshot.json");
  await download.saveAs(snapshotPath);

  await themeMode.selectOption("dark");
  await expect(themeMode).toHaveValue("dark");

  await page.locator('input[type="file"][accept="application/json"]').setInputFiles(snapshotPath);
  await expect(page.locator("#theme-mode")).toHaveValue("light");
});

test("reset workspace restores seeded defaults", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "settings");

  const themeMode = page.locator("#theme-mode");
  await themeMode.selectOption("light");
  await expect(themeMode).toHaveValue("light");

  await page.getByRole("button", { name: "Reset workspace" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).not.toBeVisible();
  await page.reload();
  await launchFromLauncher(page, "settings");
  await expect(page.locator("#theme-mode").first()).toHaveValue("system");
});

test("notification center can clear notifications", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "settings");

  await page.getByRole("button", { name: "Export desktop snapshot" }).click();
  await page.getByRole("button", { name: "Reset workspace" }).click();

  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByLabel("Notification center")).toBeVisible();
  await page.getByRole("button", { name: "Clear all notifications" }).click();
  await expect(page.getByText("No recent notifications.")).toBeVisible();
});

test("notification badge clears after opening the notification center", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "settings");

  await page.getByRole("button", { name: "Export desktop snapshot" }).click();
  await expect(page.locator(".taskbar-badge")).toBeVisible();

  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByLabel("Notification center")).toBeVisible();
  await expect(page.locator(".taskbar-badge")).toHaveCount(0);
});

test("trash flow restores a deleted file", async ({ page }) => {
  await page.goto("/");
  await launchFromLauncher(page, "file explorer");

  const welcomeRow = page.locator(".explorer-row").filter({ hasText: "Welcome Note.md" });
  await expect(welcomeRow).toBeVisible();
  await welcomeRow.getByRole("button", { name: "Move Welcome Note.md to trash" }).click();
  await expect(welcomeRow).toHaveCount(0);

  await page.locator(".sidebar-link").filter({ hasText: "Trash" }).click();
  const trashRow = page.locator(".explorer-row").filter({ hasText: "Welcome Note.md" });
  await expect(trashRow).toBeVisible();
  await trashRow.getByRole("button", { name: /Restore/i }).click();
  await expect(trashRow).toHaveCount(0);

  await page.getByRole("button", { name: "Desktop" }).click();
  await expect(page.locator(".explorer-row").filter({ hasText: "Welcome Note.md" })).toBeVisible();
});
