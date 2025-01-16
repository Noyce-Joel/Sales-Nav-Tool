/* eslint-disable @typescript-eslint/no-explicit-any */
const SALES_NAVIGATOR_DROPDOWN = "[data-x--lead-actions-bar-overflow-menu]";
const SALES_NAVIGATOR_DROPDOWN_OPTION_1 = ".ember-view._item_1xnv7i";
const SALES_NAVIGATOR_DROPDOWN_OPTION_2 = "a.ember-view";

export async function scrapeSalesNavigator(page: any): Promise<string | null> {
  try {
    // Wait for and click the dropdown
    await page.waitForSelector(SALES_NAVIGATOR_DROPDOWN);
    await page.click(SALES_NAVIGATOR_DROPDOWN);

    // Wait a bit for the dropdown to open
    await page.waitForTimeout(50);

    // Try both selectors for the LinkedIn profile link
    for (const selector of [
      SALES_NAVIGATOR_DROPDOWN_OPTION_1,
      SALES_NAVIGATOR_DROPDOWN_OPTION_2,
    ]) {
      const options = await page.$$(selector);

      for (const option of options) {
        const text = await option.evaluate((el: HTMLElement) => el.textContent);
        if (text?.includes("View LinkedIn profile")) {
          const href = await option.evaluate((el: HTMLElement) =>
            el.getAttribute("href")
          );
          console.log("Found LinkedIn profile URL:", href);

          // Close dropdown
          await page.click(SALES_NAVIGATOR_DROPDOWN);
          return href;
        }
      }
    }

    // Close dropdown if no link found
    await page.click(SALES_NAVIGATOR_DROPDOWN);
    console.error("'View LinkedIn profile' option not found");
    return null;
  } catch (error) {
    console.error("Error in scrapeSalesNavigator:", error);
    return null;
  }
}
