const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    screenshotOnRunFailure: true,
    video: false,
    
    setupNodeEvents(on, config) {
      return config;
    },
  },
});