import { join } from "path";

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  chrome: {
    skipDownload: false,
  },

  firefox: {
    skipDownload: true,
  },

  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
