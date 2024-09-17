/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import pusher from "@/lib/pusherServer";


const sendLogToClient = (message: string) => {
  pusher.trigger("scrape-channel", "scrape-log", { message });
};


const sendSearchResultsToClient = (results: unknown[]) => {
  pusher.trigger("searchresults", "new-results", { results });
};

export async function POST(request: Request) {
  const { profileUrl, location, company, currentjob, industry } = await request.json();

  if (!profileUrl) {
    return NextResponse.json(
      { error: "Profile URL is required" },
      { status: 400 }
    );
  }

  try {
    sendLogToClient("Launching browser");
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 20,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    sendLogToClient("Directing to Sales Navigator");
    await page.goto(
      "https://www.linkedin.com/uas/login?session_redirect=/sales&fromSignIn=true&trk=navigator"
    );

    sendLogToClient("Logging in");
    await page.waitForSelector("#username");
    await page.type("#username", "noyce.joel@gmail.com", { delay: 20 });

    await page.waitForSelector("#password");
    await page.type("#password", "KierReactR<35", { delay: 20 });

    await page.click('button[type="submit"]');

    sendLogToClient("Waiting for login confirmation");
    await page.waitForSelector("div.salesnav-image", {
      visible: true,
      timeout: 30000,
    });

    const session = await page.target().createCDPSession();
    await session.send("Browser.setWindowBounds", {
      windowId: (await session.send("Browser.getWindowForTarget")).windowId,
      bounds: { windowState: "minimized" },
    });

    sendLogToClient("Login successful, proceeding");
    
    await page.goto(profileUrl, {
      waitUntil: "domcontentloaded",
    });

    sendLogToClient("Accessing connections");
    await page.waitForSelector("a._bodyText_1e5nen", {
      visible: true,
      timeout: 30000,
    });

    await page.click("a._bodyText_1e5nen");

    await new Promise((resolve) => setTimeout(resolve, 6000));

    await page.waitForSelector("form.overflow-y-auto", {
      visible: true,
      timeout: 30000,
    });

    sendLogToClient("Applying filters");

    await page.locator("form.overflow-y-auto").scroll({
      scrollTop: 200,
    });

    await page.waitForSelector(
      '::-p-xpath(//span[contains(text(), "Expand Geography filter")]/ancestor::button)',
      {
        visible: true,
        timeout: 30000,
      }
    );

    await page.click(
      '::-p-xpath(//span[contains(text(), "Expand Geography filter")]/ancestor::button)'
    );

    await page.waitForSelector('input[placeholder="Add locations"]', {
      visible: true,
      timeout: 30000,
    });

    sendLogToClient("Adding location");
    await page.type('input[placeholder="Add locations"]', location);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await page.keyboard.press("ArrowDown");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.keyboard.press("Enter");

    sendLogToClient("Location added");

    await page.locator("form.overflow-y-auto").scroll({
      scrollTop: -200,
    });

    await page.waitForSelector(
      '::-p-xpath(//span[contains(text(), "Expand Current company filter")]/ancestor::button)',
      {
        visible: true,
        timeout: 30000,
      }
    );

    await page.click(
      '::-p-xpath(//span[contains(text(), "Expand Current company filter")]/ancestor::button)'
    );

    await page.waitForSelector(
      'input[placeholder="Add current companies and account lists"]',
      {
        visible: true,
        timeout: 30000,
      }
    );

    if (company) {
      sendLogToClient(`Adding company`);
      await page.type(
        'input[placeholder="Add current companies and account lists"]',
        company
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await page.keyboard.press("Enter");
      sendLogToClient("Company added");
    } else {
      sendLogToClient("No company provided, skipping company filter");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await page.keyboard.press("Escape");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const results: unknown[] = [];

    sendLogToClient("Extracting leads");
    let hasNextPage = true;
    let totalResults = 0; // Variable to track total results

    while (hasNextPage) {
      await page.waitForSelector("ol.artdeco-list", {
        visible: true,
        timeout: 30000,
      });

      await page.waitForSelector("li.artdeco-list__item", {
        visible: true,
        timeout: 30000,
      });

      await new Promise((resolve) => setTimeout(resolve, 3500));

      const searchResults = await page.evaluate(() => {
        const listItems = Array.from(
          document.querySelectorAll("li.artdeco-list__item")
        );
        const names = listItems
          .map((item) => {
            const nameElement = item.querySelector("span.a11y-text");

            if (nameElement) {
              const fullText = nameElement.textContent?.trim();
              const name = fullText
                ?.replace("Add ", "")
                .replace(" to selection", "");
              return {
                name: name || null,
              };
            }

            return null;
          })
          .filter(Boolean);

        return names;
      });

      results.push(...searchResults);
      totalResults += searchResults.length; // Update the total results count

      // Push new batch of search results to the client via Pusher
      sendSearchResultsToClient(searchResults);

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      try {
        await page.waitForSelector(
          "button.artdeco-pagination__button--next:not(:disabled)",
          {
            timeout: 5000,
          }
        );

        await page.click("button.artdeco-pagination__button--next", {
          delay: 1000,
        });
      } catch (error) {
        sendLogToClient("No more pages to navigate. Scraping completed");
        hasNextPage = false;
      }
    }

    sendLogToClient("Scraping process completed");
    await browser.close();
    sendLogToClient("Browser closed");

    return NextResponse.json({ content: results });
  } catch (error) {
    console.error("Error during scraping:", error);
    sendLogToClient("An error occurred during scraping");
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
