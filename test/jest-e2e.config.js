/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: '../jest.config.js',
  testRegex: '.*spec.ts$',
  globalSetup: '<rootDir>/global-setup.js',
  globalTeardown: '<rootDir>/global-teardown.js'
};
