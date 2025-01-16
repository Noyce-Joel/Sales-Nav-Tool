/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import pusher from "@/lib/pusherServer";
import { Connection } from "@/lib/types";
import chromium from "@sparticuz/chromium-min";
import { scrapeSalesNavigator } from "@/lib/utils/scrapeSalesNavigator";

export const maxDuration = 300;

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
  const { profileUrl, location, company, sessionCookie, title } =
    await request.json();

  if (!profileUrl) {
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
      defaultViewport: {
        width: 1420,
        height: 1080,
      },
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar"
        )),
      headless: false,
    });
    sendLogToClient("Browser launched");

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

    await page.goto(profileUrl, {
      waitUntil: "domcontentloaded",
    });
    let profile = "";
    try {
      await page.waitForSelector(
        "h1[data-x--lead--name][data-anonymize='person-name']",
        {
          visible: true,
          timeout: 5000,
        }
      );

      sendLogToClient("Login successful, proceeding");

      console.log("fetching the name of the profile");

      profile = await page.$eval(
        "h1[data-x--lead--name][data-anonymize='person-name']",
        (element) => element.textContent?.trim() || ""
      );

      sendLogToClient(`Profile: ${profile}`);

      sendProfileName(profile);
    } catch (error) {
      console.error("Error fetching the profile name:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const results: unknown[] = [];

    sendLogToClient("Extracting leads");

    let hasNextPage = true;
    let totalResults = 0;
    const allProfiles = [];
    let pageCount = 1;
    while (hasNextPage) {
      await page.waitForSelector("table.artdeco-models-table", {
        visible: true,
        timeout: 30000,
      });

      const randomDelay = Math.floor(Math.random() * (3500 - 1500 + 1)) + 1500;
      await new Promise((resolve) => setTimeout(resolve, randomDelay));

      console.log(`Processing page ${pageCount}...`);

      const profileRows = await page.$$(
        "tr.artdeco-models-table-row.ember-view"
      );
      if (!profileRows.length) {
        console.error("Profile rows not found");
        break;
      }

      for (const profileRow of profileRows) {
        const nameElement = await profileRow.$(
          '[data-anonymize="person-name"]'
        );
        if (nameElement) {
          try {
            await nameElement.click();

            const responsePromise = page.waitForResponse(
              (response) => {
                return (
                  response
                    .url()
                    .startsWith(
                      "https://www.linkedin.com/sales-api/salesApiProfiles/"
                    ) && response.status() === 200
                );
              },
              { timeout: 10000 }
            );

            const randomDelay =
              Math.floor(Math.random() * (2500 - 1250 + 1)) + 1250;
            await new Promise((resolve) => setTimeout(resolve, randomDelay));

            const rawResponse = await responsePromise;

            const responseJson = await rawResponse.json();

            const linkedinUrl = responseJson.flagshipProfileUrl;

            if (linkedinUrl) {
              console.log(`Extracted LinkedIn URL: ${linkedinUrl}`);
              sendLogToClient(`Extracted LinkedIn URL: ${linkedinUrl}`);
              allProfiles.push({ linkedinUrl });
            }
          } catch (error) {
            console.error("Error extracting LinkedIn URL:", error);
          }

          totalResults++;
        }
      }

      sendLogToClient(
        `Processed page ${pageCount}. Total results: ${totalResults}`
      );
      pageCount++;

      try {
        await page.waitForSelector(
          "button.artdeco-pagination__button--next:not(:disabled)",
          { timeout: 2000 }
        );
        await page.click("button.artdeco-pagination__button--next", {
          delay: 1500,
        });
        console.log("Navigating to the next page...");
      } catch (error) {
        sendLogToClient("Finished");
        console.log("No more pages to navigate. Scraping finished.");
        hasNextPage = false;
      }
    }

    console.log(`Scraping complete. Total results: ${totalResults}`);

    sendLogToClient("Scraping process completed");
    await browser.close();
    sendLogToClient("Browser closed");
    console.log("results", results);
    return NextResponse.json({ content: allProfiles, profile: profile });
  } catch (error) {
    console.error("Error during scraping:", error);
    sendLogToClient("An error occurred during scraping");
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
