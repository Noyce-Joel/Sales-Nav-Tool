/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import pusher from "@/lib/pusherServer";
import { Connection } from "@/lib/types";
import chromium from "@sparticuz/chromium-min";

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
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar"
        )),
      headless: chromium.setHeadlessMode,
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
    const htmlContent = await page.content();

    
    await browser.close();
    sendLogToClient("Browser closed");
    console.log("htmlContent", htmlContent);
    return NextResponse.json({ content: htmlContent });
  } catch (error) {
    console.error("Error during scraping:", error);
    sendLogToClient("An error occurred during scraping");
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
