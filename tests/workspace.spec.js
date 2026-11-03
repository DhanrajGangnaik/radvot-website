import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const nav = (page, name) =>
  page
    .getByRole("navigation", { name: "Demo workspace" })
    .getByRole("button", { name: new RegExp(name) })
    .click();
async function create(
  page,
  {
    cloud = false,
    profile = "database",
    name = "internal-db",
    fail = false,
  } = {},
) {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: /Where would you like/ }),
  ).toBeVisible();
  if (cloud) {
    await page.getByRole("button", { name: /^Cloud/ }).click();
    await page.getByLabel("Cloud provider").selectOption("AWS");
  }
  await page
    .getByRole("combobox", { name: "Target profile", exact: true })
    .selectOption(profile);
  await page
    .getByLabel("Target display name")
    .fill(cloud ? "Atlas API cloud" : "Finance database");
  await page.getByRole("button", { name: "Continue to agents" }).click();
  await page.getByLabel("Agent name", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Create agent", exact: true }).click();
  if (fail)
    await page
      .getByLabel("Deployment scenario")
      .selectOption("Enrollment interrupted");
  await page
    .getByRole("button", { name: "Simulate Deployment", exact: true })
    .click();
  if (fail) {
    await expect(
      page.getByRole("button", { name: "Retry deployment" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Retry deployment" }).click();
  }
  await expect(
    page.getByRole("button", { name: "Open RADVOT AI" }),
  ).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Open RADVOT AI" }).click();
}
async function prompt(page, text) {
  await page.getByLabel("Message RADVOT AI").fill(text);
  await page.getByRole("button", { name: "Send", exact: true }).click();
}
async function assess(page, text, { fail = false, configOnly = false } = {}) {
  await prompt(page, text);
  const plan = page.getByRole("region", { name: "Assessment proposal" });
  await expect(plan).toBeVisible();
  if (configOnly) {
    for (const label of [
      "Service exposure review",
      "Software inventory review",
    ])
      await plan.getByRole("checkbox", { name: new RegExp(label) }).uncheck();
  }
  if (fail)
    await page.getByLabel("Execution scenario").selectOption("interrupted");
  await page.getByRole("button", { name: "Approve Assessment" }).click();
  if (fail) {
    await expect(
      page.getByRole("button", { name: "Retry assessment" }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: "Retry assessment" }).click();
  }
  await expect(
    page.getByRole("heading", { name: "Clarity. Then action." }),
  ).toBeVisible({ timeout: 15000 });
}
async function overflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("onprem lifecycle: custom identity, edited scope, evidence, mitigation, retest and exports", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const dynamic = [];
  page.on("request", (req) => {
    if (["fetch", "xhr", "websocket"].includes(req.resourceType()))
      dynamic.push(req.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await create(page, { fail: true });
  await assess(page, "Assess internal-db for security vulnerabilities", {
    configOnly: true,
    fail: true,
  });
  await expect(page.locator(".rd-finding-row")).toHaveCount(3);
  await page
    .getByRole("combobox", { name: "Severity", exact: true })
    .selectOption("Critical");
  await expect(page.locator(".rd-finding-row")).toHaveCount(1);
  await page.locator(".rd-finding-row").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("CVE");
  await expect(dialog).toContainText("Not applicable");
  await expect(dialog).toContainText("9.1 / 10");
  await dialog
    .getByRole("button", { name: "Generate Mitigation Strategy" })
    .click();
  await expect(dialog).toContainText("SCRAM");
  await dialog
    .getByLabel("Mitigation follow-up")
    .fill("How can I verify the configuration?");
  await dialog.getByRole("button", { name: "Ask about finding" }).click();
  await expect(dialog.locator(".rd-reply")).toContainText("trust rule");
  await dialog
    .getByRole("button", { name: "Mark mitigation as simulated / applied" })
    .click();
  await expect(
    dialog.getByText("Not tested", { exact: true }).first(),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Request simulated retest" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Verified Resolved", {
    timeout: 5000,
  });
  await expect(dialog.locator(".rd-before-after")).toContainText(
    "unauthorized clients are denied",
  );
  await overflow(page);
  await page.screenshot({ path: info.outputPath("mitigation.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".rd-finding-row")).toBeFocused();
  await page
    .getByRole("combobox", { name: "Severity", exact: true })
    .selectOption("All");
  await page
    .getByRole("combobox", { name: "Verification", exact: true })
    .selectOption("Verified Resolved");
  await expect(page.locator(".rd-finding-row")).toHaveCount(1);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let raw = "";
  for await (const chunk of stream) raw += chunk;
  const data = JSON.parse(raw);
  expect(data.agentName).toBe("internal-db");
  expect(data.title).toBe("Illustrative Demo Report");
  expect(data.mitigations[0].verification).toBe("Verified Resolved");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".rd-print")).toBeVisible();
  await expect(page.locator(".rd-print")).toContainText("Finance database");
  await expect(page.locator(".rd-topbar")).toBeHidden();
  await page.emulateMedia({ media: "screen", reducedMotion: "reduce" });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Clarity. Then action." }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Verification", exact: true })
    .selectOption("Verified Resolved");
  await expect(page.locator(".rd-finding-row")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Verification", exact: true })
    .selectOption("All");
  await overflow(page);
  await page.screenshot({
    path: info.outputPath("report.png"),
    fullPage: true,
  });
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  expect(errors).toEqual([]);
  expect(dynamic).toEqual([]);
});
test("cloud API evidence and EPSS, followups, offline rejection and session reset", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await create(page, { cloud: true, profile: "api", name: "cloud-api" });
  await prompt(page, "Assess missing-agent");
  await expect(
    page.getByRole("log", { name: "RADVOT conversation" }),
  ).toContainText("cannot find agent");
  await expect(
    page.getByRole("region", { name: "Assessment proposal" }),
  ).toHaveCount(0);
  await nav(page, "Deployment");
  await page.getByRole("button", { name: "Simulate offline" }).click();
  await nav(page, "RADVOT AI");
  await prompt(page, "Assess cloud-api");
  await expect(
    page.getByRole("log", { name: "RADVOT conversation" }),
  ).toContainText("cloud-api is offline");
  await nav(page, "Deployment");
  await page.getByRole("button", { name: "Reconnect agent" }).click();
  await page.getByRole("button", { name: "Open RADVOT AI" }).click();
  await assess(page, "Assess cloud-api for security vulnerabilities");
  await expect(page.locator(".rd-findings-table")).toContainText(
    "Cloud management ingress",
  );
  await expect(page.locator(".rd-findings-table")).toContainText(
    "Workload identity",
  );
  await expect(page.locator(".rd-findings-table")).not.toContainText(
    "Database trusts",
  );
  await page.getByLabel("Sort by").selectOption("epss");
  await page.locator(".rd-finding-row").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("CVE-2021-44228");
  await expect(dialog).toContainText("42.0% / 90.0%");
  await expect(dialog).toContainText("Invented demo values");
  await dialog
    .getByRole("button", { name: "Generate Mitigation Strategy" })
    .click();
  await expect(dialog).toContainText("Log4j");
  await expect(dialog).toContainText("AWS example");
  await dialog
    .getByRole("button", { name: "Mark mitigation as simulated / applied" })
    .click();
  await dialog.getByLabel("Retest evidence scenario").selectOption("present");
  await dialog
    .getByRole("button", { name: "Request simulated retest" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Still present");
  await dialog
    .getByLabel("Retest evidence scenario")
    .selectOption("inconclusive");
  await dialog
    .getByRole("button", { name: "Request simulated retest" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Inconclusive");
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await nav(page, "RADVOT AI");
  await prompt(
    page,
    "Show vulnerabilities with the highest exploitation likelihood",
  );
  await expect(
    page.getByRole("log", { name: "RADVOT conversation" }),
  ).toContainText("Log4j");
  await nav(page, "Environment");
  await page.getByRole("button", { name: /^On-Premises/ }).click();
  await page.getByRole("button", { name: "Continue to agents" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep current session" }).click();
  await nav(page, "Deployment");
  await expect(
    page.getByRole("heading", { name: "Bring cloud-api online." }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".rd-signal")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await overflow(page);
  await page.screenshot({
    path: info.outputPath("cloud-deployment.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.getByRole("button", { name: "Confirm reset / delete" }).click();
  await expect(
    page.getByRole("heading", { name: /Where would you like/ }),
  ).toBeVisible();
  await nav(page, "Agents");
  await expect(
    page.getByRole("heading", { name: "Choose your environment first" }),
  ).toBeVisible();
});
test("route entry, mobile layout, accessible environment and multi-agent selection", async ({
  page,
}, info) => {
  test.setTimeout(45000);
  await page.goto("/");
  await expect(page.locator(".cin-header nav a")).toHaveAttribute(
    "href",
    "/demo",
  );
  await page.locator(".cin-header nav a").click();
  await expect(page).toHaveURL(/\/demo$/);
  await page.screenshot({
    path: info.outputPath("environment.png"),
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await overflow(page);
  }
  await page.setViewportSize(info.project.use.viewport);
  await create(page, { profile: "linux", name: "alpha" });
  await nav(page, "Agents");
  await page.getByLabel("Agent name", { exact: true }).fill("beta");
  await page.getByRole("button", { name: "Create agent", exact: true }).click();
  await nav(page, "RADVOT AI");
  await prompt(page, "Assess alpha and beta");
  await expect(
    page.getByRole("log", { name: "RADVOT conversation" }),
  ).toContainText("multiple agents");
  await page
    .getByRole("log", { name: "RADVOT conversation" })
    .getByRole("button", { name: "alpha", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Assessment proposal" }),
  ).toContainText("alpha");
  await page.getByRole("button", { name: "Cancel proposal" }).click();
  await nav(page, "Agents");
  await page
    .getByRole("button", { name: "Rename", exact: true })
    .first()
    .click();
  await page.getByLabel("New agent name").fill("alpha-prod");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(
    page.getByRole("button", { name: "alpha-prod", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Confirm reset / delete" }).click();
  await expect(page.locator(".rd-agent-card")).toHaveCount(1);
  await overflow(page);
});
