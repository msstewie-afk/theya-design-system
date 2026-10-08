// Storybook test-runner's own Jest config, plus one setup file
// (.storybook/jest-retry.js) that retries a failed story on CI.
const { getJestConfig } = require('@storybook/test-runner');

const config = getJestConfig();

module.exports = {
  ...config,
  setupFilesAfterEnv: [...(config.setupFilesAfterEnv ?? []), require.resolve('./.storybook/jest-retry.js')],
};
