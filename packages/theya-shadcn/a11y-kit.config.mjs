// a11y-kit configuration for Theya (packages/a11y-kit). See its bin/a11y-kit.mjs.
import fs from 'node:fs';
import path from 'node:path';

export default {
  // Storybook title → component, from spec/index.json; patterns (blocks) are named after their title.
  componentTitles(root) {
    const map = new Map();
    const spec = JSON.parse(fs.readFileSync(path.join(root, 'spec/index.json'), 'utf8'));
    for (const c of spec.components) {
      const s = JSON.parse(fs.readFileSync(path.join(root, c.spec), 'utf8'));
      if (s.storybook?.title) map.set(s.storybook.title, c.name);
    }
    for (const f of fs.readdirSync(path.join(root, 'src/components/blocks'), { recursive: true })) {
      if (!f.endsWith('.stories.tsx')) continue;
      const title = /\btitle:\s*'([^']+)'/.exec(fs.readFileSync(path.join(root, 'src/components/blocks', f), 'utf8'))?.[1];
      if (title) map.set(title, title.split('/').pop());
    }
    return map;
  },
  // The stories the kit's own checks are calibrated on (fixtures and W3C ACT test cases).
  calibrationStories: ['src/test/a11y-fixtures.stories.tsx', 'src/test/a11y-act.stories.tsx'],
  registryOut: 'a11y/registry.json',
  listOut: '../../docs/a11y-checks',
  // How .storybook/test-runner.ts runs axe: every enabled rule (no tag filter)
  // plus target-size, any impact fails the story, scanned inside #storybook-root.
  axe: { enable: ['target-size'], root: '#storybook-root' },
  // The change review (packages/a11y-kit/review/agent.md), run on every push
  // to main that touches components, styles or tokens (.github/workflows/a11y-review.yml).
  review: {
    paths: ['src/components', 'src/styles', '../tokens/src', ':(exclude,glob)**/*.stories.tsx', ':(exclude,glob)**/*.guidelines.tsx'],
    read: ['../../CONTRIBUTING.md', '../../TESTING.md'],
    cases: 'a11y/review-cases.json', // calibration of the review (a11y-review-calibrate.yml)
    // Accepted deviations from the hand-kept part of the matrix, so the agent doesn't re-report them.
    notes(root) {
      const manual = JSON.parse(fs.readFileSync(path.join(root, 'a11y/manual.json'), 'utf8'));
      const lines = [
        '- Focus ring: the soft focus ring is under 3:1 on purpose, a library-wide accepted deviation (1.4.11). Report a change only if it takes away the other visible focus change (border or background) where a control had one, or makes the ring itself fainter.',
        `- Components where the soft ring is the only visible focus change (accepted): ${manual.focusRingOnly.join(', ')}.`,
        '- Forced colors: src/styles/forced-colors.css gives controls system-colour borders and outlines. A change that adds a box-shadow-only edge or focus indicator needs a forced-colors rule there.',
      ];
      for (const [component, list] of Object.entries(manual.deviations ?? {}))
        for (const d of list) if (d.criterion && d.note) lines.push(`- ${component}, ${d.criterion}: ${d.note}`);
      return lines.join('\n');
    },
    tokens: {
      files: ['../tokens/build/css/variables.css', '../tokens/build/css/variables-dark.css', 'src/styles/globals.css'],
      light: [':root', '@theme'],
      dark: [':root', '@theme', '[data-theme="dark"]'],
      page: 'background',
    },
  },
};
