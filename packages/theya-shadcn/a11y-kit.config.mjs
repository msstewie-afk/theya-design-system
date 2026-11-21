// a11y-kit configuration for Theya (packages/a11y-kit). See its bin/a11y-kit.mjs.
import fs from 'node:fs';
import path from 'node:path';

const config = {
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
  // Known, tracked failures: in the results and the matrix, warnings (not errors) in CI.
  // Each names its owner and where it is tracked; remove the entry with the fix.
  known: {
    '1.4.10': {
      SiteHeader: 'agent 1: header overflows 320px by 9px (backlog 21.11)',
      'Landing page': 'agent 1: the SiteHeader overflow above (backlog 21.11)',
      Hero: 'agent 1: "Split with chips" media overflows 320px (backlog 21.11)',
    },
  },
  // The code reader (a11y-kit code): every component's source and the global stylesheets.
  code: {
    targets(root) {
      const index = JSON.parse(fs.readFileSync(path.join(root, 'spec/index.json'), 'utf8'));
      const targets = index.components.map((c) => ({ name: c.name, file: path.join(root, 'src/components', `${c.file}.tsx`) }));
      // Patterns too, named like build-a11y.mjs names them (the story title's last segment).
      const blocks = path.join(root, 'src/components/blocks');
      for (const f of fs.readdirSync(blocks, { recursive: true }).filter((f) => f.endsWith('.stories.tsx')).sort()) {
        const base = path.join(blocks, f.slice(0, -'.stories.tsx'.length));
        if (!fs.existsSync(`${base}.tsx`)) continue;
        const title = /\btitle:\s*'([^']+)'/.exec(fs.readFileSync(`${base}.stories.tsx`, 'utf8'))?.[1];
        targets.push({ name: title?.split('/').pop() ?? path.basename(base), file: `${base}.tsx` });
      }
      return targets;
    },
    styles: ['src/styles'],
  },
  // The audit (packages/a11y-kit/review/auditor.md): stale reviews in a11y/manual.json and
  // the matrix's untested / partial cells; answers go back into a11y/manual.json.
  audit: {
    async files(root) {
      return new Map((await this.targets(root)).map((t) => [t.name, [t.file]]));
    },
    targets(root) {
      return config.code.targets(root);
    },
    reviews(root) {
      return JSON.parse(fs.readFileSync(path.join(root, 'a11y/manual.json'), 'utf8')).reviews ?? {};
    },
    open(root) {
      const spec = JSON.parse(fs.readFileSync(path.join(root, 'spec/a11y.json'), 'utf8'));
      return [...spec.components, ...spec.patterns].flatMap((row) =>
        Object.entries(row.wcag ?? {})
          .filter(([, v]) => v === 'untested' || v === 'partial')
          .map(([sc, status]) => ({ component: row.name, sc, status })),
      );
    },
    // Line by line: manual.json is hand-formatted (one review per line), so only
    // the lines of the records written change; nothing else is reflowed.
    apply(root, records) {
      const file = path.join(root, 'a11y/manual.json');
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      const one = (r) => '{' + Object.entries(r).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ') + '}';
      const start = lines.findIndex((l) => l === '  "reviews": {');
      // The end of the reviews block: the first line back at its indent.
      const end = lines.findIndex((l, i) => i > start && l.startsWith('  }'));
      let n = 0;
      for (const [component, bySc] of Object.entries(records)) {
        let open = lines.findIndex((l, i) => i > start && i < end && l === `    ${JSON.stringify(component)}: {`);
        if (open < 0) {
          // A component with no reviews yet: a new block at the end of reviews.
          const at = lines.findIndex((l, i) => i > start && l.startsWith('  }'));
          lines[at - 1] = lines[at - 1].endsWith(',') ? lines[at - 1] : lines[at - 1] + ',';
          lines.splice(at, 0, `    ${JSON.stringify(component)}: {`, '    }');
          open = at;
        }
        for (const [sc, record] of Object.entries(bySc)) {
          const close = lines.findIndex((l, i) => i > open && l.startsWith('    }'));
          const at = lines.findIndex((l, i) => i > open && i < close && l.startsWith(`      ${JSON.stringify(sc)}: `));
          if (at > -1) lines[at] = `      ${JSON.stringify(sc)}: ${one(record)}${lines[at].trimEnd().endsWith(',') ? ',' : ''}`;
          else {
            if (close - 1 > open) lines[close - 1] = lines[close - 1].endsWith(',') ? lines[close - 1] : lines[close - 1] + ',';
            lines.splice(close, 0, `      ${JSON.stringify(sc)}: ${one(record)}`);
          }
          n++;
        }
      }
      const text = lines.join('\n');
      JSON.parse(text); // still valid JSON, or nothing is written
      fs.writeFileSync(file, text);
      return n;
    },
  },
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

export default config;
