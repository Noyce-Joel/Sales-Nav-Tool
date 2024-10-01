/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path');

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  // Download and use the default Chrome version.
  chrome: {
    skipDownload: false,  // Ensure Chrome is downloaded if not already
  },
  
  // If you want to support Firefox (cross-browser testing)
  firefox: {
    skipDownload: true,  // You can set this to false to download Firefox too
  },
  
  // Customize the cache directory (helpful for environments with build steps)
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),

  // Optional: You could set default args or env settings if needed
};
