import { test, expect } from "@playwright/test";
test("grades sort, remain readable in dark mode, and print every column", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") console.log(message.text());
  });
  page.on("requestfailed", (request) =>
    console.log("Request failed", request.url(), request.failure()?.errorText),
  );
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    let data: unknown = [];
    if (url.pathname === "/api/auth/session") data = null;
    if (url.pathname === "/api/school-years")
      data = [{ id: "year", label: "2026-2027" }];
    if (url.pathname === "/api/sections")
      data = [{ id: "class", name: "Test Class" }];
    if (url.pathname === "/api/subjects")
      data = [{ id: "subject", name: "Test Subject" }];
    if (url.pathname === "/api/grades")
      data = [
        {
          studentId: "a",
          studentCode: "0010",
          name: "Zara Example",
          total: null,
        },
        { studentId: "b", studentCode: "0002", name: "Ali Example", total: 90 },
      ];
    if (url.pathname === "/api/grades/class-sheet")
      data = {
        subject: {
          id: "subject",
          name: "Test Subject",
          teacherName: "Test Teacher",
          section: { name: "Test Class" },
          schoolYear: { label: "2026-2027" },
        },
        students: [
          { id: "b", studentId: "0002", name: "Ali Example", total: 90 },
          { id: "a", studentId: "0010", name: "Zara Example", total: null },
        ],
        gradeItems: Array.from({ length: 18 }, (_, i) => ({
          id: `item${i}`,
          date: "2026-10-01T00:00:00.000Z",
          component: "QUIZ",
          maxScore: 10,
          scores: { b: 9 },
        })),
      };
    await route.fulfill({ json: data });
  });
  await page.goto("/grades");
  await expect(page.getByRole("button", { name: /Print/ })).toBeDisabled();
  await page.getByLabel("School year", { exact: true }).selectOption("year");
  await page
    .getByLabel("Class / Section", { exact: true })
    .selectOption("class");
  await expect(page.getByRole("button", { name: /Print/ })).toBeEnabled();
  await page.getByRole("button", { name: /Student ID/ }).click();
  await expect(page.locator("tbody tr").first()).toContainText("0002");
  await page.getByRole("button", { name: /Student ID/ }).click();
  await expect(page.locator("tbody tr").first()).toContainText("0010");
  await page.getByRole("button", { name: /Overall Average/ }).click();
  await expect(page.locator("tbody tr").last()).toContainText("Not graded");
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printed = "yes";
    };
  });
  await page.getByRole("button", { name: /Print/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "yes");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator(".paper-report")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`overview-${width}.png`),
      fullPage: true,
    });
  }
  await page.getByLabel("Subject", { exact: true }).selectOption("subject");
  await expect(page.locator(".grade-sheet-part")).toHaveCount(3);
  await page.screenshot({
    path: testInfo.outputPath("class-sheet.png"),
    fullPage: true,
  });
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: /Print/ })).not.toBeVisible();
  await page.pdf({
    path: testInfo.outputPath("class-sheet.pdf"),
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(errors).toEqual([]);
});
