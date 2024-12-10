/* eslint-disable @typescript-eslint/no-var-requires */
// server.js

const express = require("express");
const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium-min");
const Pusher = require("pusher"); // Adjust the path as needed
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const pusher = new Pusher({
  appId: "1782394",
  key: "4fcccdcae4f122837dfa",
  secret: "fd7d535960e5f61dab74",
  cluster: "eu",
  useTLS: true,
});
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Set Chromium to headless mode
chromium.setHeadlessMode = true;

// Utility functions to send logs and data to clients via Pusher
const sendLogToClient = (message) => {
  pusher.trigger("scrape-channel", "scrape-log", { message });
};

const sendProfileName = (name) => {
  pusher.trigger("profile-name-channel", "name", { name });
};

const sendConnectionsToClient = (connection) => {
  pusher.trigger("connections-channel", "connection", { connection });
};

// POST route for scraping
app.post("/scrape", async (req, res) => {
  const { profileUrl, location, company, sessionCookie, title } = await req.body;

  if (!profileUrl) {
    return res.status(400).json({ error: "Profile URL is required" });
  }

  const isLocal = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

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
        isLocal ||
        (await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar"
        )),
      headless: chromium.headless,
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
          timeout: 30000,
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

    sendLogToClient("Accessing connections");
    await page.waitForSelector("a._bodyText_1e5nen", {
      visible: true,
      timeout: 30000,
    });

    await page.click("a._bodyText_1e5nen");

    await new Promise((resolve) => setTimeout(resolve, 3000));

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

    if (location) {
      await page.type('input[placeholder="Add locations"]', location);
      await new Promise((resolve) => setTimeout(resolve, 500));

      await page.keyboard.press("ArrowDown");
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.keyboard.press("Enter");
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

    if (company) {
      await page.type(
        'input[placeholder="Add current companies and account lists"]',
        company
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.keyboard.press("Enter");
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
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

    if (title) {
      await page.type('input[placeholder="Add current titles"]', title);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.keyboard.press("Enter");
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {

      await page.keyboard.press("Escape");
    }

    try {
      const noLeadsMessage = await page.waitForSelector(
        '::-p-xpath(//h3[contains(text(), "No leads matched your search")])',
        {
          visible: true,
          timeout: 5000,
        }
      );

      if (noLeadsMessage) {
        sendLogToClient("No leads matched your search.");
        console.log("No leads matched the search.");
        await browser.close();
        sendLogToClient("Browser closed");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error occurred: ${error.message}`);
      } else {
        console.error("An unknown error occurred");
      }
    }


    const results = [];

    sendLogToClient("Extracting leads");

    let hasNextPage = true;
    let totalResults = 0;
    let pageCount = 1;
    while (hasNextPage) {
      await page.waitForSelector("ol.artdeco-list", {
        visible: true,
        timeout: 30000,
      });

      let currentResults = [];
      let retryCount = 0;
      const maxRetries = 5;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      while (currentResults.length < 23 && retryCount < maxRetries) {
        currentResults = await page.evaluate(() => {
          const items = Array.from(
            document.querySelectorAll("li.artdeco-list__item")
          );
          return items
            .map((item) => {
              const leadIdElement = item.querySelector(
                "[data-scroll-into-view]"
              );

              let leadId = null;
              if (leadIdElement) {
                const leadIdMatch = leadIdElement
                  .getAttribute("data-scroll-into-view")
                  ?.match(/salesProfile:\(([^)]+)\)/);
                if (leadIdMatch && leadIdMatch[1]) {
                  leadId = leadIdMatch[1];
                }
              }

              if (leadId) {
                return { leadId }; // Return the leadId object instead of null
              } else {
                return null;
              }
            })
            .filter((result) => result !== null); // Filter out any null results
        });

        if (currentResults.length < 23) {
          sendLogToClient(`Profiles not scraped, retrying...`);
          console.log(
            `Retrying: ${retryCount}, profiles scraped: ${currentResults.length}`
          );
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (retryCount === maxRetries) {
        sendLogToClient(`${maxRetries} retries: limit reached`);
        console.log(
          `Max retries (${maxRetries}) reached with ${currentResults.length} profiles scraped`
        );
      }

      if (currentResults.length > 0) {
        console.log(
          `Adding ${currentResults.length} profiles to the results array`
        );

        currentResults.forEach((lead) =>
          sendConnectionsToClient(lead)
        );
        results.push(...currentResults);
      }

      totalResults += currentResults.length;
      sendLogToClient(`Total : ${totalResults}`);
      pageCount++;
      console.log("pageCount", pageCount);
      if (currentResults.length < 23) {
        sendLogToClient("Complete");
        console.log(
          "Fewer than 25 profiles found on this page. Scraping finished."
        );
        hasNextPage = false;
        break;
      }

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

    return res.json({ content: results, profile });
  } catch (error) {
    console.error("Error during scraping:", error);
    sendLogToClient("An error occurred during scraping");
    return res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});