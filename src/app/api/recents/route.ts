/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import pusher from "@/lib/pusherServer";
import { Connection } from "@/lib/types";
import chromium from "@sparticuz/chromium-min";

chromium.setHeadlessMode = true;

const sendLogToClient = (message: string) => {
  pusher.trigger("scrape-channel", "scrape-log", { message });
};

const sendProfileName = (name: string) => {
  pusher.trigger("profile-name-channel", "name", { name });
};

const sendConnectionsToClient = (connection: Connection) => {
  pusher.trigger("connections-channel", "connection", { connection });
};

export async function POST(request: Request) {
  const { data, sessionCookie } = await request.json();
  console.log("profile data", data);
  if (!data.url) {
    return NextResponse.json(
      { error: "Profile URL is required" },
      { status: 400 }
    );
  }

  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  try {
    sendLogToClient("Launching browser");
    const browser = await puppeteer.launch({
      args: isLocal
        ? puppeteer.defaultArgs()
        : [
            ...chromium.args,
            "--hide-scrollbars",
            "--incognito",
            "--no-sandbox",
           
          ],
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(
          "https://connections.moonfire.s3.amazonaws.com/chromium-v126.0.0-pack.tar"
        )),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    sendLogToClient("Directing to Sales Navigator");
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    sendLogToClient("Setting LinkedIn session cookie");
    const cookies = [
      {
        name: "li_at",
        value: sessionCookie,
        domain: ".linkedin.com",
        path: "/",
        httpOnly: true,
        secure: true,
      },
    ];

    await page.setCookie(...cookies);

    sendLogToClient("Login successful, proceeding");

    await page.goto(data.url, {
      waitUntil: "domcontentloaded",
    });
    let profile = "";
    try {
      await page.waitForSelector(
        "h1[data-x--lead--name][data-anonymize='person-name']",
        {
          visible: true,
          timeout: 30000,
        }
      );

      console.log("fetching the name of the profile");

      profile = await page.$eval(
        "h1[data-x--lead--name][data-anonymize='person-name']",
        (element) => element.textContent?.trim() || ""
      );

      console.log("Profile Name:", profile);

      sendProfileName(profile);

      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Error fetching the profile name:", error);
    }

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

    if (data.location) {
      await page.type('input[placeholder="Add locations"]', data.location);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await page.keyboard.press("ArrowDown");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.keyboard.press("Enter");
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.keyboard.press("Escape");
    }

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

    if (data.company) {
      sendLogToClient(`Adding company`);
      await page.type(
        'input[placeholder="Add current companies and account lists"]',
        data.company
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.keyboard.press("Enter");
      sendLogToClient("Company added");
    } else {
      sendLogToClient("No company provided, skipping company filter");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.keyboard.press("Escape");
    }

    await page.locator("form.overflow-y-auto").scroll({
      scrollTop: 200,
    });

    await page.waitForSelector(
      '::-p-xpath(//span[contains(text(), "Expand Current job title filter")]/ancestor::button)',
      {
        visible: true,
        timeout: 30000,
      }
    );

    await page.click(
      '::-p-xpath(//span[contains(text(), "Expand Current job title filter")]/ancestor::button)'
    );

    await page.waitForSelector('input[placeholder="Add current titles"]', {
      visible: true,
      timeout: 30000,
    });

    if (data.title) {
      await page.type('input[placeholder="Add current titles"]', data.title);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.keyboard.press("Enter");
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.keyboard.press("Escape");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const existingConnections = new Set(
      data.connections.map((conn: { leadId: string }) => conn.leadId)
    );

    const results: unknown[] = [];

    sendLogToClient("Extracting leads");

    let hasNextPage = true;
    let totalResults = 0;

    while (hasNextPage) {
      const noLeads = await page.evaluate(() => {
        const noLeadsMessage = document.querySelector(
          "div.illustration-spots-large.empty-room"
        );
        return noLeadsMessage ? true : false;
      });

      if (noLeads) {
        sendLogToClient(
          "No more leads matched your search. Scraping complete."
        );
        console.log("No leads matched the search.");
        await browser.close();
        sendLogToClient("Browser closed");
        return NextResponse.json({ content: results, profile: profile });
      }

      await page.waitForSelector("ol.artdeco-list", {
        visible: true,
        timeout: 30000,
      });

      const currentResults: any[] = [];
      let itemCount = 0;
      let retryCount = 0;
      const maxRetries = 3;

      // Step 1: Scrape all leadIds and filter out those already in the database
      const allLeadIds = await page.evaluate(() => {
        const profileNodes = document.querySelectorAll("li.artdeco-list__item");
        return Array.from(profileNodes)
          .map((item) => {
            const leadIdElement = item.querySelector("[data-scroll-into-view]");
            if (leadIdElement) {
              const leadIdMatch = leadIdElement
                .getAttribute("data-scroll-into-view")
                ?.match(/salesProfile:\(([^)]+)\)/);
              return leadIdMatch ? leadIdMatch[1] : null;
            }
            return null;
          })
          .filter((leadId) => leadId !== null);
      });

      const leadIdsToScrape = allLeadIds.filter(
        (leadId) => leadId && !existingConnections.has(leadId)
      );

      sendLogToClient(`Found ${leadIdsToScrape.length} new leads to scrape`);

      // Step 2: Scrape details of profiles whose leadIds are not in the database
      while (currentResults.length < 25 && retryCount < maxRetries) {
        itemCount = leadIdsToScrape.length;

        for (
          let i = currentResults.length;
          i < itemCount && currentResults.length < 25;
          i++
        ) {
          const leadId = leadIdsToScrape[i];

          const profileIndex = await page.evaluate((leadId) => {
            const profileNodes = document.querySelectorAll(
              "li.artdeco-list__item"
            );
            return Array.from(profileNodes).findIndex((item) => {
              const leadIdElement = item.querySelector(
                "[data-scroll-into-view]"
              );
              if (leadIdElement) {
                const leadIdMatch = leadIdElement
                  .getAttribute("data-scroll-into-view")
                  ?.match(/salesProfile:\(([^)]+)\)/);
                return leadIdMatch && leadIdMatch[1] === leadId;
              }
              return false;
            });
          }, leadId);

          if (profileIndex === -1) continue;

          await page.evaluate((index) => {
            const element = document.querySelectorAll("li.artdeco-list__item")[
              index
            ];
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, profileIndex);

          await new Promise((resolve) => setTimeout(resolve, 2000));

          const leadData = await page.evaluate((index) => {
            const item = document.querySelectorAll("li.artdeco-list__item")[
              index
            ];
            const nameElement = item.querySelector("span.a11y-text");
            const locationElement = item.querySelector(
              "span[data-anonymize='location']"
            );
            const companyElement = item.querySelector(
              "a[data-anonymize='company-name']"
            );
            const pictureElement = item.querySelector(
              "img[data-anonymize='headshot-photo']"
            );
            const titleElement = item.querySelector(
              "span[data-anonymize='title']"
            );
            const urlElement = item.querySelector(
              "a[data-view-name='search-results-lead-name']"
            );
            const leadIdElement = item.querySelector("[data-scroll-into-view]");

            let leadId = null;
            if (leadIdElement) {
              const leadIdMatch = leadIdElement
                .getAttribute("data-scroll-into-view")
                ?.match(/salesProfile:\(([^)]+)\)/);
              leadId = leadIdMatch ? leadIdMatch[1] : null;
            }

            if (leadId && nameElement) {
              const fullText = nameElement.textContent?.trim();
              const name = fullText
                ?.replace("Add ", "")
                .replace(" to selection", "");
              const picture = pictureElement
                ? (pictureElement as HTMLImageElement).src
                : null;
              const location = locationElement
                ? locationElement.textContent?.trim()
                : null;
              const company = companyElement
                ? companyElement.textContent?.trim()
                : null;
              const title = titleElement
                ? titleElement.textContent?.trim()
                : null;

              return {
                leadId: leadId || null,
                name: name || null,
                picture: picture || null,
                linkedinUrl: urlElement
                  ? (urlElement as HTMLAnchorElement).href
                  : null,
                title: title || null,
                company: company || null,
                location: location || null,
              };
            }

            return null;
          }, profileIndex);

          if (leadData) {
            currentResults.push(leadData);
            sendConnectionsToClient(leadData);
            console.log(`Scraped profile with leadId: ${leadData.leadId}`);
          }
        }

        if (currentResults.length < 25) {
          sendLogToClient(
            `Only scraped ${currentResults.length} profiles, retrying...`
          );
          console.log(
            `Retrying: ${retryCount}, profiles scraped: ${currentResults.length}`
          );
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (retryCount === maxRetries) {
          sendLogToClient(
            `Unable to scrape full 25 profiles after ${maxRetries} retries, moving to next page`
          );
          console.log(
            `Max retries (${maxRetries}) reached with ${currentResults.length} profiles scraped, moving to next page`
          );
          break;
        }
      }

      if (currentResults.length > 0) {
        console.log(
          `Adding ${currentResults.length} profiles to the results array`
        );
        results.push(...currentResults);
      }

      totalResults += currentResults.length;
      console.log(`Total profiles so far: ${totalResults}`);

      try {
        await page.waitForSelector(
          "button.artdeco-pagination__button--next:not(:disabled)",
          { timeout: 2000 }
        );

        await page.click("button.artdeco-pagination__button--next", {
          delay: 2000,
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Navigating to the next page...");
      } catch (error) {
        sendLogToClient("No more pages to navigate. Scraping completed");
        console.log("No more pages to navigate. Scraping finished.");
        hasNextPage = false;
      }
    }

    console.log(`Scraping complete. Total results: ${totalResults}`);

    sendLogToClient("Scraping process completed");
    await browser.close();
    sendLogToClient("Browser closed");

    return NextResponse.json({ content: results, profile: profile });
  } catch (error) {
    console.error("Error during scraping:", error);
    sendLogToClient("An error occurred during scraping");
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
