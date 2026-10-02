import StyleDictionary from 'style-dictionary';

const commonSource = [
  'src/primitive/color.json',
  'src/primitive/size.json',
  'src/primitive/typography.json',
  'src/semantic/size.json',
  'src/semantic/typography.json',
];

export default {
  // Code is the source of truth for tokens since 2026-10-02; changes are
  // carried over to Figma by hand, not exported from it. src/primitive and
  // src/semantic are edited directly (scripts/convert-figma-tokens.py is
  // retired — running it would overwrite those edits). src/code/* holds
  // tokens that never existed in Figma (on-primary set, charts, elevation,
  // motion, layers).
  source: [...commonSource, 'src/semantic/color.default.json', 'src/code/color.json', 'src/code/foundation.json'],
  platforms: {
    css: {
      transforms: [
        'attribute/cti',
        'name/kebab',
        'time/seconds',
        'html/icon',
        'size/px',
        'color/css',
        'asset/url',
        'fontFamily/css',
        'cubicBezier/css',
      ],
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: { selector: ':root' },
        },
      ],
    },
    js: {
      // Not transformGroup 'js': that group uses size/rem, which turned our
      // unitless px sizes into rem (12 -> "12rem"). Same transforms as the
      // js group, but size/px like the CSS platform.
      transforms: ['attribute/cti', 'name/pascal', 'size/px', 'color/hex'],
      buildPath: 'build/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
    'tailwind-json': {
      transforms: ['attribute/cti', 'name/pascal', 'size/px', 'color/hex'],
      buildPath: 'build/tailwind/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/nested',
        },
      ],
    },
  },
};

// Dark theme is built separately — see build-dark.mjs — because Style
// Dictionary resolves one value per token per run. We swap
// src/semantic/color.default.json for src/semantic/color.dark.json
// and re-run against a different output file (variables-dark.css).
