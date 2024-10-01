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
  
  // Customize the cache directory (helpful for environments with build steps)
  cacheDirectory: '/home/sbx_user1051/.cache/puppeteer',

  // Optional: You could set default args or env settings if needed
};
