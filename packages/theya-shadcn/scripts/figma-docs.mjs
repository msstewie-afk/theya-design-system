#!/usr/bin/env node
/**
 * Code reference for every Theya component in Figma (Theya Design System, nDNke2R7fqqFFCrRy1ilBy).
 *
 * Figma Code Connect needs an Organization or Enterprise plan; the file lives
 * on a Pro team. This is the Pro-compatible substitute: each component set's
 * description starts with a generated block — the JSX, the import, the props
 * with their values and defaults, the Storybook path — and its documentation
 * link points at the source file. Dev Mode and the Assets panel show both.
 *
 * Everything comes from spec/components/*.json (generated from the component
 * sources by build-spec.mjs), so the block cannot drift from the code: rerun
 * after an API change and the descriptions follow.
 *
 * The block is separated from the hand-written design notes below it by a
 * line with a single "—". On rerun only the part above that line is replaced;
 * the notes are kept. A description without the separator is treated as
 * notes and the block is put in front of it.
 *
 * Usage:
 *   npm run figma:docs        → writes build/figma/docs.js
 * Paste that file into the Figma MCP `use_figma` tool (skill figma-use) or
 * the plugin console. It returns { updated, unchanged, missing, unmapped }:
 * `unmapped` lists Figma components on design-system pages that this script
 * has no entry for — either add them to FIGMA below or remove them from Figma.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_URL = 'https://github.com/msstewie-afk/theya-design-system/blob/main/packages/theya-shadcn/src/components';

// --- spec index ----------------------------------------------------------------

const specDir = path.join(ROOT, 'spec/components');
const specs = fs.readdirSync(specDir).map((f) => JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8')));
/** Exported component name → { spec, component } */
const byExport = new Map();
for (const spec of specs) for (const component of spec.components ?? []) if (!byExport.has(component.name)) byExport.set(component.name, { spec, component });
const bySpecName = new Map(specs.map((s) => [s.name, s]));

// --- Figma component → code ------------------------------------------------------
//
// Key: the Figma component set (or standalone component) name.
//   code:  exported component name in @theya/shadcn (looked up in the spec)
//   fixed: props a Figma set pins (Button/primary is <Button tone="primary">)
//   part:  not exported — an internal piece of `parent`; text says how it is set
//   none:  no code component; text says what to use instead

const FIGMA = {
  'Button/primary': { code: 'Button', fixed: { tone: 'primary' } },
  'Button/secondary': { code: 'Button', fixed: { tone: 'secondary' } },
  'Button/neutral': { code: 'Button', fixed: { tone: 'neutral' } },
  'Button/success': { code: 'Button', fixed: { tone: 'success' } },
  'Button/warning': { code: 'Button', fixed: { tone: 'warning' } },
  'Button/danger': { code: 'Button', fixed: { tone: 'danger' } },
  'Button/info': { code: 'Button', fixed: { tone: 'info' } },
  'Button/on-primary': { code: 'Button', text: 'any tone, inside a surface with data-surface="primary" (Card appearance="filled"); every tone collapses to the on-primary look.' },
  FAB: { code: 'Fab' },
  DialogClose: { code: 'DialogClose' },
  TopbarAction: { code: 'TopbarAction' },
  PasswordToggle: { part: 'Password', text: 'The show/hide button inside Password; rendered by the component, not used on its own.' },
  HelpIcon: { code: 'HelpIcon' },
  LightboxControl: { part: 'Lightbox', text: 'Previous / next / close controls inside Lightbox; rendered by the component.' },
  Toggle: { code: 'Toggle' },
  ToggleGroup: { code: 'ToggleGroup' },
  TextField: { code: 'TextField' },
  TextArea: { code: 'TextArea' },
  Checkbox: { code: 'Checkbox' },
  Radio: { code: 'Radio' },
  Switch: { code: 'Switch' },
  Select: { code: 'Select' },
  SelectContent: { code: 'SelectContent' },
  SelectItem: { code: 'SelectItem' },
  SelectLabel: { code: 'SelectLabel' },
  SelectSeparator: { code: 'SelectSeparator' },
  TagInput: { code: 'TagInput' },
  Combobox: { code: 'Combobox' },
  ComboboxContent: { part: 'Combobox', text: 'The popup list of Combobox (a PopoverContent); options come from the `options` prop.' },
  Rating: { code: 'Rating' },
  RatingStar: { code: 'RatingStar' },
  Field: { code: 'Field' },
  Label: { code: 'Label' },
  Breadcrumb: { code: 'Breadcrumb' },
  BreadcrumbLink: { code: 'BreadcrumbLink' },
  BreadcrumbPage: { code: 'BreadcrumbPage' },
  BreadcrumbSeparator: { code: 'BreadcrumbSeparator' },
  BreadcrumbEllipsis: { code: 'BreadcrumbEllipsis' },
  Link: { code: 'Link' },
  Sidebar: { code: 'Sidebar' },
  SidebarItem: { code: 'SidebarItem' },
  SidebarSectionLabel: { part: 'Sidebar', text: 'The `label` of SidebarSection: <SidebarSection label="Workspace">…</SidebarSection>.' },
  TabsList: { code: 'TabsList' },
  TabsTrigger: { code: 'TabsTrigger' },
  Topbar: { code: 'Topbar' },
  DropdownMenu: { code: 'DropdownMenuContent' },
  DropdownMenuItem: { code: 'DropdownMenuItem' },
  DropdownMenuCheckboxItem: { code: 'DropdownMenuCheckboxItem' },
  DropdownMenuRadioItem: { code: 'DropdownMenuRadioItem' },
  DropdownMenuSubTrigger: { code: 'DropdownMenuSubTrigger' },
  DropdownMenuLabel: { code: 'DropdownMenuLabel' },
  DropdownMenuSeparator: { code: 'DropdownMenuSeparator' },
  Dialog: { code: 'DialogContent' },
  Drawer: { code: 'DrawerContent' },
  PopoverContent: { code: 'PopoverContent' },
  Tooltip: { code: 'TooltipContent' },
  ProductTour: { code: 'ProductTour' },
  Alert: { code: 'Alert' },
  Progress: { code: 'Progress' },
  StatusDot: { code: 'StatusDot' },
  Status: { part: 'StatusDot', text: 'A composition, not a component: <StatusDot tone="…" /> followed by the status text.' },
  Toast: { code: 'Toaster', also: ['toast'], text: 'mount once; show toasts with toast() / toast.success() / toast.error().' },
  Avatar: { code: 'Avatar' },
  AvatarGroup: { code: 'AvatarGroup' },
  BadgeIndicator: { code: 'BadgeIndicator' },
  Badge: { code: 'Badge' },
  Kbd: { code: 'Kbd' },
  Chip: { code: 'Chip' },
  ListItem: { code: 'ListItem' },
  TableHead: { code: 'TableHead' },
  TableCell: { code: 'TableCell' },
  Stat: { code: 'Stat' },
  DataTableColumnHeader: { code: 'DataTableColumnHeader', text: 'the `header` of a sortable column: header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" />. Sort state comes from the column; align end is meta.align="right".' },
  DataTableSelectCell: { part: 'DataTable', text: 'The select column DataTable adds with enableSelection (column id SELECT_COLUMN_ID); rendered by the table, not by hand.' },
  DataTableToolbar: { code: 'DataTableToolbar', text: 'state=selected is what it renders while rows are selected (count + `actions`); state=default shows select-all, `idleLeft` and `children` (search, filters).' },
  PaginationLink: { code: 'PaginationLink', also: ['PaginationPrevious', 'PaginationNext', 'PaginationEllipsis'], text: 'kind=page is PaginationLink (isActive on the current page); previous / next / ellipsis are PaginationPrevious, PaginationNext, PaginationEllipsis. DataTable renders its own footer from `pagination`.' },
  CodeBlock: { code: 'CodeBlock', text: 'header=true when `filename` or `language` is set (copy sits in the header, ghost); header=false floats a tonal copy button top-right.' },
  KanbanCard: { code: 'KanbanCard', text: 'the default card for renderItem; state=placeholder is the slot a dragged card leaves, state=overlay the dragged copy (Elevation/lg, rotated 2°).' },
  KanbanColumn: { part: 'Kanban', text: 'One column from `columns` ({ id, title, tone, limit }); the count turns into a danger Badge over `limit`, an empty column shows `emptyMessage`. Drop target = border-primary.' },
  SchedulerEvent: { part: 'Scheduler', text: 'An event from `events` ({ title, start, end, allDay, tone }): timed block in week/day, short (< 45 px) puts the time inline, all-day and month cells use the chip.' },
  ChartTooltip: { part: 'BarChart', text: 'The tooltip every chart renders on hover (BarChart, LineChart, AreaChart, DonutChart); not used on its own.' },
  BarChart: { code: 'BarChart' },
  LineChart: { code: 'LineChart' },
  AreaChart: { code: 'AreaChart' },
  DonutChart: { code: 'DonutChart' },
  Sparkline: { code: 'Sparkline' },
  ChartRangeSelection: { code: 'ChartRangeSelection', text: 'wraps a Recharts chart (here AreaChart) and adds drag / keyboard range selection; the band is chart-01 at 16% with a 65% edge.' },
  UsageBar: { code: 'UsageBar' },
  CodeEditor: { code: 'CodeEditor', text: 'header shows with filename / language / copy / clearable; `inverse` darkens only the code area (header stays on the surface). Highlight colors are the code/* tokens.' },
  DiffViewer: { code: 'DiffViewer', text: 'view=unified | split (viewToggle shows the Unified / Split switch); stats, language and lineNumbers are props; unchanged runs longer than `context` collapse to a gap row.' },
  DiffLine: { part: 'DiffViewer', text: 'One diff row, built from oldValue / newValue. Changed words (wordDiff) get the stronger -subtle fill; split view leaves an empty cell where a side has no line.' },
  DiffGapRow: { part: 'DiffViewer', text: 'The expander row for a collapsed unchanged run (`context`, `expandLabel`).' },
  Terminal: { code: 'Terminal', text: 'inverse=true (default) is a fixed dark island (data-theme="dark"): code.*-inverse surface, on-dark header text. connection sets the StatusDot tone; header shows when user / host / status / tools is set.' },
  TerminalLine: { code: 'TerminalLine', text: 'one line of the `lines` prop ({ text, level }); compose by hand only with children. Aliases: ok = success, warn = warning, err = error, dim = muted.' },
  Card: { code: 'Card' },
  CardMedia: { code: 'CardMedia' },
  CardAvatar: { code: 'CardAvatar' },
  Separator: { code: 'Separator' },
  PageHeader: { code: 'PageHeader' },
  Accordion: { code: 'Accordion' },
  AccordionItem: { code: 'AccordionItem' },
  Toolbar: { code: 'Toolbar' },
  ToolbarSeparator: { code: 'ToolbarSeparator' },
  ToolbarLink: { code: 'ToolbarLink' },
  // Built in Figma Oct 2026 (the rest of the library except Motion).
  KebabIcon: { code: 'KebabIconVertical', also: ['KebabIconHorizontal'], text: 'orientation=horizontal is KebabIconHorizontal.' },
  CopyButton: { code: 'CopyButton' },
  SplitButton: { code: 'SplitButton' },
  DensityToggle: { code: 'DensityToggle' },
  ThemeToggle: { code: 'ThemeToggle' },
  StickyActionBar: { code: 'StickyActionBar' },
  NumberField: { code: 'NumberField' },
  InputGroup: { code: 'InputGroup' },
  InputOTP: { code: 'InputOTP' },
  SecretField: { code: 'SecretField' },
  PasswordStrengthMeter: { code: 'PasswordStrengthMeter' },
  InlineEdit: { code: 'InlineEdit' },
  MaskedInput: { code: 'MaskedInput' },
  PhoneField: { code: 'PhoneField' },
  RichTextEditor: { code: 'RichTextEditor' },
  CheckboxGroup: { code: 'CheckboxGroup' },
  OptionCard: { code: 'OptionCard' },
  SwatchPicker: { code: 'SwatchPicker' },
  ColorPicker: { code: 'ColorPicker' },
  ColorField: { code: 'ColorField' },
  Autocomplete: { code: 'Autocomplete' },
  Calendar: { code: 'Calendar' },
  DatePicker: { code: 'DatePicker' },
  DateRangePicker: { code: 'DateRangePicker' },
  TimeField: { code: 'TimeField' },
  DateTimePicker: { code: 'DateTimePicker' },
  TimeRangePicker: { code: 'TimeRangePicker' },
  Slider: { code: 'Slider' },
  RangeField: { code: 'RangeField' },
  Attachment: { code: 'Attachment' },
  File: { code: 'File' },
  Dropzone: { code: 'Dropzone' },
  ImageCropper: { code: 'ImageCropper' },
  'Form (example)': { part: 'Form', text: 'An example form: FormField + FormItem / FormLabel / FormControl / FormDescription / FormMessage around Theya fields (react-hook-form). Not a component to place as is.' },
  Fieldset: { code: 'Fieldset' },
  PropertyGrid: { code: 'PropertyGrid' },
  Command: { code: 'Command' },
  Filter: { code: 'Filter' },
  FilterField: { code: 'FilterField' },
  QueryBuilder: { code: 'QueryBuilder' },
  Stepper: { code: 'Stepper' },
  Menubar: { code: 'Menubar' },
  NavigationMenu: { code: 'NavigationMenu' },
  ContextMenu: { code: 'ContextMenu' },
  AlertDialog: { code: 'AlertDialog' },
  ConfirmDialog: { code: 'ConfirmDialog' },
  PushSheet: { code: 'PushSheet' },
  HoverCardContent: { code: 'HoverCardContent', also: ['HoverCard', 'HoverCardTrigger'] },
  KeyboardShortcuts: { code: 'KeyboardShortcuts' },
  MessagePopup: { code: 'MessagePopup' },
  AnnouncementBar: { code: 'AnnouncementBar' },
  EmptyState: { code: 'EmptyState' },
  FeedbackWidget: { code: 'FeedbackWidget' },
  Meter: { code: 'Meter' },
  Skeleton: { code: 'Skeleton' },
  TableSkeleton: { code: 'TableSkeletonRows' },
  UndoToast: { none: true, text: "A function, not a component: `import { undoToast } from '@theya/shadcn/ui/undo-toast'` and call undoToast({ title, onUndo, onCommit }); it renders through the mounted Toaster. Storybook: Status & Feedback/UndoToast" },
  DotSeparator: { code: 'DotSeparator' },
  ToneIcon: { code: 'ToneIcon' },
  DataTableCell: { code: 'DataTableCell' },
  Metric: { code: 'Metric' },
  DescriptionList: { code: 'DescriptionList', also: ['DescriptionItem', 'DescriptionTerm', 'DescriptionDetails'] },
  Price: { code: 'Price' },
  Countdown: { code: 'Countdown' },
  QrCode: { code: 'QrCode' },
  TimelineItem: { code: 'TimelineItem', also: ['TimelineTitle', 'TimelineDescription', 'TimelineTime'] },
  Timeline: { code: 'Timeline', also: ['TimelineItem'] },
  TreeItem: { part: 'Tree', text: 'One row Tree renders for each node in `items` ({ id, label, icon, children, disabled }); depth sets the indent.' },
  Tree: { code: 'Tree' },
  Chat: { code: 'Chat', also: ['ChatMessages'] },
  Message: { code: 'Message' },
  PromptArea: { code: 'PromptArea' },
  PromptSuggestion: { part: 'PromptSuggestions', text: 'One entry of `items` ({ id, label, icon }); rendered by PromptSuggestions.' },
  PromptSuggestions: { code: 'PromptSuggestions' },
  AspectRatio: { code: 'AspectRatio' },
  Carousel: { code: 'Carousel', also: ['CarouselContent', 'CarouselItem', 'CarouselPrevious', 'CarouselNext'] },
  CarouselIndicators: { code: 'CarouselIndicators' },
  Collapsible: { code: 'Collapsible', also: ['CollapsibleTrigger', 'CollapsibleContent'] },
  Prose: { code: 'Prose' },
  Resizable: { code: 'ResizablePanelGroup', also: ['ResizablePanel', 'ResizableHandle'] },
  ScrollArea: { code: 'ScrollArea' },
};

// --- text -------------------------------------------------------------------------

const MAX_PROPS = 14;
const HIDDEN_PROPS = new Set(['className', 'children', 'style']);

/** `"a" | "b" | null` → "a | b"; other types stay as they are. */
function values(type) {
  const literals = type.split('|').map((s) => s.trim()).filter((s) => s !== 'null' && s !== 'undefined');
  return literals.every((s) => /^".*"$/.test(s)) ? literals.map((s) => s.slice(1, -1)).join(' | ') : null;
}

function propLine(props, fixed) {
  const shown = props.filter((p) => !HIDDEN_PROPS.has(p.name) && !(p.name in fixed));
  const parts = shown.slice(0, MAX_PROPS).map((p) => {
    const v = values(p.type);
    const def = p.default && p.default !== 'undefined' && p.default !== 'false' ? ` (${p.default})` : '';
    if (v) return `\`${p.name}\` ${v}${def}`;
    if (/^boolean/.test(p.type)) return `\`${p.name}\`${p.default === 'true' ? ' (true)' : ''}`;
    return `\`${p.name}\``;
  });
  if (shown.length > MAX_PROPS) parts.push(`+${shown.length - MAX_PROPS} more`);
  return parts.length ? `**Props:** ${parts.join(' · ')}` : null;
}

function block(figmaName, entry) {
  if (entry.none) return { text: `**Code:** none. ${entry.text}`, link: null };
  const target = entry.code ?? entry.part;
  const found = byExport.get(target) ?? (bySpecName.has(target) ? { spec: bySpecName.get(target), component: null } : null);
  if (!found) throw new Error(`${figmaName}: no "${target}" in spec/components — renamed in code? Update FIGMA in scripts/figma-docs.mjs`);
  const { spec, component } = found;
  const link = `${REPO_URL}/${spec.file}.tsx`;
  // The module path comes from the spec; the names are the ones this Figma
  // component needs, not the module's whole export list.
  const from = spec.import.match(/from '([^']+)'/)?.[1];
  if (!from) throw new Error(`${spec.name}: cannot read the module path from "${spec.import}"`);
  const importLine = (names) => `import { ${names.join(', ')} } from '${from}';`;
  const meta = [spec.storybook?.title ? `Storybook: ${spec.storybook.title}` : null, spec.status !== 'stable' ? spec.status : null].filter(Boolean).join(' · ');

  if (entry.part) {
    return { text: [`**Code:** part of ${spec.name}. ${entry.text}`, `\`${importLine([spec.name])}\``, meta].filter(Boolean).join('\n\n'), link };
  }
  const fixed = entry.fixed ?? {};
  const attrs = Object.entries(fixed).map(([k, v]) => ` ${k}="${v}"`).join('');
  const lines = [
    `**Code:** \`<${component.name}${attrs}>\`${entry.text ? ` — ${entry.text}` : ''}`,
    `\`${importLine([component.name, ...(entry.also ?? [])])}\``,
    propLine(component.props ?? [], fixed),
    meta,
  ];
  return { text: lines.filter(Boolean).join('\n\n'), link };
}

const docs = {};
for (const [name, entry] of Object.entries(FIGMA)) docs[name] = block(name, entry);

// --- Figma script -------------------------------------------------------------------

const runtime = `
// Generated by packages/theya-shadcn/scripts/figma-docs.mjs — do not edit.
// Writes the code block at the top of each component description and the
// documentation link; keeps the design notes below the "—" separator.
const SEP = '\\n\\n—\\n\\n';
const SKIP_PAGE = /legacy|interactive|wpt|library|prototype|cover|---|📐|🎨|typography|^icons$/i;
const found = new Map();
const unmapped = [];
for (const page of figma.root.children) {
  if (SKIP_PAGE.test(page.name)) continue;
  await page.loadAsync();
  const nodes = page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    .filter((n) => n.type === 'COMPONENT_SET' || n.parent.type !== 'COMPONENT_SET');
  for (const n of nodes) {
    if (n.name.startsWith('_')) continue;
    if (DOCS[n.name]) found.set(n.name, [...(found.get(n.name) || []), n]);
    else unmapped.push(page.name + ' / ' + n.name);
  }
}
let updated = 0, unchanged = 0;
for (const [name, nodes] of found) {
  const { text, link } = DOCS[name];
  for (const n of nodes) {
    const current = n.descriptionMarkdown || n.description || '';
    const at = current.indexOf(SEP);
    // Plain descriptions come back HTML-escaped; older ones that only named
    // the code component ("Code: …") are superseded by the generated block.
    const raw = at >= 0 ? current.slice(at + SEP.length) : /^\\*{0,2}Code:/.test(current) ? '' : current;
    const notes = raw.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
    const next = notes ? text + SEP + notes : text;
    const links = link ? [{ uri: link }] : [];
    const sameLinks = JSON.stringify(n.documentationLinks.map((l) => l.uri)) === JSON.stringify(links.map((l) => l.uri));
    if (current === next && sameLinks) { unchanged++; continue; }
    n.descriptionMarkdown = next;
    n.documentationLinks = links;
    updated++;
  }
}
const missing = Object.keys(DOCS).filter((k) => !found.has(k));
return { updated, unchanged, missing, unmapped };
`;

const outDir = path.join(ROOT, 'build/figma');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'docs.js'), `const DOCS = ${JSON.stringify(docs)};\n${runtime}`);
console.log(`figma docs: ${Object.keys(docs).length} components → build/figma/docs.js`);
