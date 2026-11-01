import type { NextConfig } from 'next';

// Deliberately empty: no transpilePackages, no aliases. The pilot checks
// that @theya/shadcn works the way an outside app would install it.
const config: NextConfig = {};

export default config;
