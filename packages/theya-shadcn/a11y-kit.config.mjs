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
};
