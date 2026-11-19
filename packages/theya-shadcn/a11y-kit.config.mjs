// a11y-kit configuration for Theya (packages/a11y-kit). See its bin/a11y-kit.mjs.
export default {
  // The stories the kit's own checks are calibrated on (fixtures and W3C ACT test cases).
  calibrationStories: ['src/test/a11y-fixtures.stories.tsx', 'src/test/a11y-act.stories.tsx'],
  registryOut: 'a11y/registry.json',
  listOut: '../../docs/a11y-checks',
  // How .storybook/test-runner.ts runs axe: every enabled rule (no tag filter)
  // plus target-size, any impact fails the story, scanned inside #storybook-root.
  axe: { enable: ['target-size'], root: '#storybook-root' },
};
