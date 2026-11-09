// Prototype transitions between the states of Theya's Figma components, so an
// instance in a prototype behaves like the code: hover on pointer enter, pressed
// while the mouse is down, a click toggles checked / selected / open, a click
// in a field focuses it, Next / Back walk a tour. Run it in the Figma MCP
// use_figma tool on the Theya file with `const SET_IDS = [<ids from
// sets.txt>];` in front (set ONLY to limit it to some sets). It replaces the reactions on every variant of the listed sets and
// on the nested buttons it wires (ProductTour, FeedbackWidget, Carousel); it is
// safe to run again.
//
// Rules (Maria, 2026-11-09): no transition into focus for buttons and links
// (Figma can't move keyboard focus one control at a time); disabled, read-only
// and loading variants get none. Mouse enter / leave instead of "while
// hovering", so a click on the hover variant can change checked / selected and
// the leave returns to the default of the NEW value.

const ONLY = null; // e.g. ['Button/primary', 'Checkbox']

const T = { type: 'SMART_ANIMATE', easing: { type: 'EASE_OUT' }, duration: 0.15 };
const go = (dest) => ({ type: 'NODE', destinationId: dest.id, navigation: 'CHANGE_TO', transition: T, preserveScrollPosition: false });
const on = (type, dest, extra = {}) => ({ trigger: { type, ...extra }, actions: [go(dest)] });
const enter = (d) => on('MOUSE_ENTER', d, { delay: 0 });
const leave = (d) => on('MOUSE_LEAVE', d, { delay: 0 });
const down = (d) => on('MOUSE_DOWN', d, { delay: 0 });
const up = (d) => on('MOUSE_UP', d, { delay: 0 });
const click = (d) => on('ON_CLICK', d);
const after = (d, seconds) => on('AFTER_TIMEOUT', d, { timeout: seconds });

// set name -> list of operations
const HOVER = ['hover'];
const BUTTON = ['hover', 'press'];
const FIELD = ['hover', ['click', 'state', ['default', 'hover'], 'focus'], ['click', 'state', ['error'], 'error-focus']];
const SELECTABLE = ['hover', ['click', 'state', ['default', 'hover'], 'selected'], ['click', 'state', ['selected'], 'default']];
const NAV = ['hover', ['click', 'state', ['default', 'hover'], 'active']];
const RULES = {
  DialogClose: HOVER, TopbarAction: HOVER, PasswordToggle: HOVER, HelpIcon: HOVER, ThemeToggle: HOVER,
  BreadcrumbLink: HOVER, Link: HOVER, DiffGapRow: HOVER, PromptSuggestion: HOVER, Slider: HOVER,
  File: [['hover', 'empty']], Dropzone: [['hover', 'idle']],
  LightboxControl: BUTTON, FAB: BUTTON,
  'Button/primary': BUTTON, 'Button/secondary': BUTTON, 'Button/neutral': BUTTON, 'Button/success': BUTTON,
  'Button/warning': BUTTON, 'Button/danger': BUTTON, 'Button/info': BUTTON, 'Button/on-primary': BUTTON,
  Toggle: ['hover', ['toggle', 'pressed', 'false', 'true']],
  CopyButton: [['click', 'state', ['idle'], 'copied'], ['after', 'state', 'copied', 'idle', 1.5]],
  TextField: FIELD, TextArea: FIELD, NumberField: FIELD, InputGroup: FIELD, TagInput: FIELD, Combobox: FIELD,
  CodeEditor: FIELD, PromptArea: FIELD, PhoneField: FIELD, RichTextEditor: FIELD,
  InputOTP: [['click', 'state', ['empty'], 'active']],
  InlineEdit: [['hover', 'idle'], ['click', 'state', ['idle', 'hover'], 'editing']],
  FilterField: [['click', 'state', ['empty'], 'focus']],
  Checkbox: ['hover', ['toggle', 'checked', 'false', 'true'], ['click', 'checked', ['indeterminate'], 'true']],
  Switch: ['hover', ['toggle', 'checked', 'false', 'true']],
  Radio: ['hover', ['click', 'checked', ['false'], 'true']],
  OptionCard: ['hover', ['click', 'state', ['default', 'hover'], 'checked']],
  Select: ['hover', ['click', 'state', ['default', 'hover'], 'open'], ['click', 'state', ['open'], 'default']],
  Autocomplete: [['click', 'state', ['default', 'focus'], 'open'], ['click', 'state', ['open'], 'default']],
  DatePicker: [['click', 'state', ['default'], 'open'], ['click', 'state', ['open'], 'default']],
  DateRangePicker: [['click', 'state', ['default'], 'open'], ['click', 'state', ['open'], 'default']],
  Filter: [['click', 'state', ['default', 'active'], 'open']],
  SelectItem: [['hover', 'default', 'highlighted'], ['click', 'selected', ['false'], 'true']],
  DropdownMenuItem: [['hover', 'default', 'highlighted']],
  DropdownMenuSubTrigger: [['hover', 'default', 'highlighted']],
  DropdownMenuCheckboxItem: [['hover', 'default', 'highlighted'], ['toggle', 'checked', 'false', 'true']],
  DropdownMenuRadioItem: [['hover', 'default', 'highlighted'], ['click', 'checked', ['false'], 'true']],
  PaginationLink: NAV, SidebarItem: NAV, TabsTrigger: NAV, BottomNavItem: NAV,
  Menubar: [['toggle', 'open', 'false', 'true']],
  NavigationMenu: [['toggle', 'open', 'false', 'true']],
  Chip: SELECTABLE, ListItem: SELECTABLE, TreeItem: SELECTABLE, Card: SELECTABLE,
  Attachment: [['click', 'state', ['default'], 'selected'], ['click', 'state', ['selected'], 'default']],
  TableCell: ['hover', ['hover', 'selected', 'selected-hover']],
  AccordionItem: ['hover', ['toggle', 'open', 'false', 'true']],
  Collapsible: [['toggle', 'state', 'closed', 'open']],
  // nested buttons, by label or layer name: [label, from step, to step]
  ProductTour: [['nested', 'step', [['Next', 'first', 'middle'], ['Next', 'middle', 'last'], ['Back', 'middle', 'first'], ['Back', 'last', 'middle']]]],
  FeedbackWidget: [['nested', 'step', [['No', 'ask', 'details'], ['Yes', 'ask', 'done'], ['Send feedback', 'details', 'done'], ['Skip', 'details', 'done']]]],
  Carousel: [['nested', 'state', [['CarouselNext', 'first', 'middle'], ['CarouselNext', 'middle', 'last'], ['CarouselPrevious', 'middle', 'first'], ['CarouselPrevious', 'last', 'middle']]]],
};

const parse = (name) => Object.fromEntries(name.split(',').map((p) => p.split('=').map((x) => x.trim())).filter((p) => p.length === 2));
const key = (props) => Object.keys(props).sort().map((k) => `${k}=${props[k]}`).join('|');

// The label a nested button shows: its text property, its accessible-looking
// layer name, or its first text.
function labelOf(node) {
  if (node.type === 'INSTANCE') {
    const props = node.componentProperties;
    const k = Object.keys(props).find((x) => /^(label|text)#/i.test(x) && props[x].type === 'TEXT');
    if (k) return String(props[k].value);
  }
  const t = 'findOne' in node ? node.findOne((n) => n.type === 'TEXT') : null;
  return t ? t.characters : node.name;
}

// The set ids from scripts/figma-visual/sets.txt (the caller prepends
// `const SET_IDS = [...]`; the Plugin API can't list sets on unloaded pages).
const IDS = typeof SET_IDS === 'undefined' ? [] : SET_IDS;

const report = {};
for (const id of IDS) {
  const set = await figma.getNodeByIdAsync(id);
  if (!set || set.type !== 'COMPONENT_SET') continue;
  const rules = RULES[set.name];
  if (!rules || (ONLY && !ONLY.includes(set.name))) continue;
  const variants = set.children.filter((c) => c.type === 'COMPONENT');
  const byKey = new Map(variants.map((v) => [key(parse(v.name)), v]));
  const find = (props, change) => byKey.get(key({ ...props, ...change }));
  const reactions = new Map(variants.map((v) => [v.id, []]));
  const add = (v, r) => reactions.get(v.id).push(r);
  let nested = 0;
  for (const v of variants) {
    const p = parse(v.name);
    for (const rule of rules) {
      const [op, ...a] = Array.isArray(rule) ? rule : [rule];
      if (op === 'hover') {
        // ['hover'] = state default <-> hover; ['hover', from] = state from <-> hover;
        // ['hover', from, to] = state from <-> to
        const from = a[0] ?? 'default', to = a[1] ?? 'hover';
        if (p.state === from) { const d = find(p, { state: to }); if (d) add(v, enter(d)); }
        if (p.state === to) { const d = find(p, { state: from }); if (d) add(v, leave(d)); }
      } else if (op === 'press') {
        if (p.state === 'hover') { const d = find(p, { state: 'pressed' }); if (d) add(v, down(d)); }
        if (p.state === 'pressed') {
          const h = find(p, { state: 'hover' }); if (h) add(v, up(h));
          const d = find(p, { state: 'default' }); if (d) add(v, leave(d));
        }
      } else if (op === 'toggle') {
        const [prop, x, y] = a;
        if (p.state && !['default', 'hover', 'highlighted', 'closed', 'open'].includes(p.state)) continue;
        if (p[prop] === x) { const d = find(p, { [prop]: y }); if (d) add(v, click(d)); }
        else if (p[prop] === y) { const d = find(p, { [prop]: x }); if (d) add(v, click(d)); }
      } else if (op === 'click') {
        const [prop, froms, to] = a;
        if (prop !== 'state' && p.state && !['default', 'hover', 'highlighted'].includes(p.state)) continue;
        if (froms.includes(p[prop])) {
          // a hover-only state goes to the target's default if there is no
          // hover version of it (focus, open, active have none)
          const d = find(p, { [prop]: to });
          if (d) add(v, click(d));
        }
      } else if (op === 'after') {
        const [prop, from, to, s] = a;
        if (p[prop] === from) { const d = find(p, { [prop]: to }); if (d) add(v, after(d, s)); }
      } else if (op === 'nested') {
        const [prop, steps] = a;
        for (const [label, from, to] of steps) {
          if (p[prop] !== from) continue;
          const d = find(p, { [prop]: to });
          if (!d) continue;
          // by the button's label, or by layer name (icon-only arrows)
          const target = v.findAll((n) => n.type === 'INSTANCE' && (labelOf(n) === label || n.name === label))[0];
          if (!target) continue;
          await target.setReactionsAsync([click(d)]);
          nested++;
        }
      }
    }
  }
  let wired = 0;
  for (const v of variants) {
    const r = reactions.get(v.id);
    if (r.length || v.reactions.length) await v.setReactionsAsync(r);
    if (r.length) wired++;
  }
  report[set.name] = { variants: variants.length, wired, nested };
}
return report;
