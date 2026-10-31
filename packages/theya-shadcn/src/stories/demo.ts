/**
 * Shared demo data for stories and guidelines: Aether, a platform for
 * photographers. One product across the whole Storybook, so the examples tell
 * one story instead of each story inventing its own.
 *
 * The theme is light and sight, after Theia (the Titaness of light and sight,
 * mother of Helios, Selene and Eos), with a few quiet easter eggs:
 * - Mnemosyne (memory, Theia's sister) is the name of the archive;
 * - studios are named after her children; Othrys is the Titans' mountain;
 * - Studio L4: Theia is the hypothetical planet from the L4 Lagrange point whose
 *   collision with Earth made the Moon;
 * - 384 GB of storage ~ 384,400 km to the Moon; 4,500 photos ~ 4.5 billion years.
 *
 * Plans keep their usual names (Free, Pro, Business). Vocabulary map from the
 * old hosting demo: sites -> galleries, servers -> studios, databases and
 * backups -> archive, certificates -> licenses, domains -> client portals,
 * bandwidth -> downloads. Full table: the project doc claude/demo-theme-light.md.
 *
 * Not exported from the package: stories and guidelines import it directly.
 */

export const PRODUCT = 'Aether';
export const DOMAIN = 'aether.photo';

export const STUDIOS = {
  helios: { name: 'Helios Studio', portal: 'helios.aether.photo', focus: 'Commercial and product' },
  selene: { name: 'Selene Weddings', portal: 'selene-weddings.aether.photo', focus: 'Weddings and night shoots' },
  eos: { name: 'Eos Portraits', portal: 'eos-portraits.aether.photo', focus: 'Morning portraits' },
  phoebe: { name: 'Phoebe Light Lab', portal: 'phoebe-lab.aether.photo', focus: 'Prints and film' },
  othrys: { name: 'Othrys Lodge', portal: 'othrys.aether.photo', focus: 'Location shoots' },
  l4: { name: 'Studio L4', portal: 'l4.aether.photo', focus: 'Satellite studio' },
} as const;

export const PEOPLE = {
  thea: { name: 'Thea Marlow', email: 'thea@aether.photo', role: 'Owner' },
  elio: { name: 'Elio Sanz', email: 'elio@aether.photo', role: 'Photographer' },
  selin: { name: 'Selin Arda', email: 'selin@aether.photo', role: 'Wedding photographer' },
  dawn: { name: 'Dawn Ellery', email: 'dawn@aether.photo', role: 'Retoucher' },
  phoebe: { name: 'Phoebe Lark', email: 'phoebe@aether.photo', role: 'Print lab' },
  ian: { name: 'Ian Hyde', email: 'ian@aether.photo', role: 'Client manager' },
  mina: { name: 'Mina Ostrova', email: 'mina@aether.photo', role: 'Archivist' },
  rhea: { name: 'Rhea Okafor', email: 'rhea.okafor@example.com', role: 'Client' },
  theo: { name: 'Theo Amari', email: 'theo.amari@example.com', role: 'Client' },
  layla: { name: 'Layla Haddad', email: 'layla.haddad@example.com', role: 'Client' },
  chen: { name: 'Chen Yue', email: 'chen.yue@example.com', role: 'Client' },
} as const;

export const ALBUMS = ['Golden hour', 'Blue hour', 'First light', 'Moonrise over Othrys', 'Wide-shining', 'Isthmian Five'] as const;

export const FILES = ['DAWN_0412.jpg', 'GOLDEN_0907.tif', 'L4_moonrise.raw'] as const;

/** The archive section. */
export const ARCHIVE = 'Mnemosyne';

/** Storage quota in GB (about the distance to the Moon in thousands of km). */
export const STORAGE_GB = 384;
