import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup } from './select';
import type { SelectTriggerProps, SelectItemProps } from './select';
import type { StatusTone } from './status-dot';
import type { BadgeTone } from './badge';
import { Label } from './label';
import { Cloud, Globe, Server } from 'iconoir-react';

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#rocket-clip)">
        <path d="M9.09335 19.1867L5.28001 20.44C3.57335 21 2.05335 22.5333 1.48001 24.24L0.226679 28.0533C-0.666654 30.7733 1.22668 32.68 3.94668 31.7733L7.76001 30.52C9.46668 29.96 10.9867 28.4267 11.56 26.72L12.8133 22.9067C13.7067 20.1867 11.8133 18.28 9.09335 19.1867Z" fill="#FF9F17"/>
        <path d="M9.64001 19.7067L7.38668 20.6133C6.38668 21.0133 5.50668 21.8933 5.10668 22.8933L4.20001 25.1467C3.38668 27.16 4.82668 28.6 6.85335 27.8L9.10668 26.8933C10.1067 26.4933 10.9867 25.6133 11.3867 24.6133L12.2933 22.36C13.1067 20.3467 11.6667 18.9067 9.64001 19.7067Z" fill="#F96500"/>
        <path d="M17.56 27C17.9067 28.0533 18.04 29.1066 17.9733 30.1333C17.8933 31.4266 19.2133 32.36 20.4133 31.8666C21.88 31.2666 23.2267 30.1733 24.1733 28.68C26.4533 25.0933 27.0267 19.3866 23.7733 17.32C20.64 15.3333 15.12 17.4133 12.6667 20.76C14.8533 22.0133 16.7333 24.5066 17.56 27.0133V27Z" fill="#0098ED"/>
        <path d="M25.52 19.4266L22.3467 22.6C21.6 23.3466 21.0133 24.2666 20.72 25.2933C20.6267 25.6 20.5867 25.8666 20.6267 25.9866C20.9733 27.04 21.1067 28.0933 21.04 29.12C20.9867 29.9333 21.48 30.5866 22.1467 30.8666C22.92 30.28 23.6267 29.5733 24.1867 28.6933C25.9067 25.9866 26.6533 22.0933 25.52 19.44V19.4266Z" fill="#0098ED"/>
        <path d="M25.52 19.4266L22.36 22.5866C20.32 24.6266 20.4933 25.5866 20.6267 25.9866C20.9733 27.04 21.1067 28.0933 21.04 29.12C20.9867 29.9333 21.48 30.5866 22.1467 30.8666C22.92 30.28 23.6267 29.5733 24.1867 28.6933C25.9067 25.9866 26.6533 22.0933 25.52 19.44V19.4266Z" fill="#3ECAFF"/>
        <path d="M5.00001 14.44C3.94667 14.0933 2.89334 13.96 1.86667 14.0266C0.573341 14.1066 -0.359993 12.7866 0.133341 11.5866C0.746674 10.12 1.82667 8.7733 3.32001 7.82663C6.90667 5.54663 12.6133 4.9733 14.68 8.22663C16.6667 11.36 14.5867 16.88 11.24 19.3333C9.98667 17.1466 7.49334 15.28 4.98667 14.44H5.00001Z" fill="#0098ED"/>
        <path d="M12.5733 6.47997L9.40001 9.6533C8.65335 10.4 7.73335 10.9866 6.70668 11.28C6.40001 11.3733 6.13335 11.4133 6.01335 11.3733C4.96001 11.0266 3.90668 10.8933 2.88001 10.96C2.06668 11.0133 1.41335 10.52 1.13335 9.8533C1.72001 9.07997 2.42668 8.3733 3.30668 7.8133C6.01335 6.0933 9.92001 5.34663 12.56 6.47997H12.5733Z" fill="#0098ED"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M32 0.599966C31.4933 8.3333 28.9867 14.5466 22.9467 20.68L20.28 23.0266C19.0267 24.0133 17.6133 24.9866 16.2667 25.8666C14.92 26.7466 13.3467 26.8533 11.9733 26.2666L11.8667 26.2266C11.3467 26.0133 10.8933 25.6933 10.4933 25.3066L6.70668 21.52C6.30668 21.12 6.00001 20.6533 5.78668 20.1466C5.18668 18.7333 5.37334 17.0666 6.28001 15.7466L9.00001 11.7333C9.48001 11.12 9.94668 10.5466 10.4133 10.04L11.0933 9.31997C17.2933 3.07997 23.56 0.519966 31.4 -3.35305e-05C31.7467 -0.0267002 32.0133 0.2533 32 0.599966Z" fill="#0098ED"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M13 19.04L31.8533 0.186636C31.7467 0.0666361 31.5867 -3.05176e-05 31.4 -3.05176e-05C23.56 0.519969 17.2933 3.07997 11.0667 9.30664L10.3867 10.0266C9.92001 10.5333 9.45334 11.1066 8.97334 11.72L6.25334 15.7333C6.10668 15.9466 6.01334 16.1866 5.90668 16.4133L8.53334 19.04C9.76001 20.2666 11.76 20.2666 13 19.04Z" fill="#3ECAFF"/>
        <path d="M20.24 17.52C23.4212 17.52 26 14.9411 26 11.76C26 8.57881 23.4212 5.99997 20.24 5.99997C17.0589 5.99997 14.48 8.57881 14.48 11.76C14.48 14.9411 17.0589 17.52 20.24 17.52Z" fill="#0098ED"/>
        <path d="M20.24 16.08C22.6259 16.08 24.56 14.1458 24.56 11.76C24.56 9.3741 22.6259 7.43997 20.24 7.43997C17.8541 7.43997 15.92 9.3741 15.92 11.76C15.92 14.1458 17.8541 16.08 20.24 16.08Z" fill="#C7EFFF"/>
        <path opacity="0.7" d="M16.7467 9.22664C17.4533 8.70664 18.3333 8.39997 19.28 8.39997C21.6667 8.39997 23.6 10.3333 23.6 12.72C23.6 13.6666 23.2933 14.5466 22.7733 15.2533C23.8533 14.4666 24.56 13.2 24.56 11.76C24.56 9.37331 22.6267 7.43997 20.24 7.43997C18.8 7.43997 17.5333 8.14664 16.7467 9.22664Z" fill="#61DAFF"/>
        <path d="M22.0267 12.6533C22.1333 12.76 22.1333 12.9333 22.0267 13.04C20.44 14.6266 17.88 14.6266 16.2933 13.04C16.1867 12.9333 16.1867 12.76 16.2933 12.6533C16.4 12.5466 16.5733 12.5466 16.68 12.6533C18.0533 14.0266 20.28 14.0266 21.6533 12.6533C21.76 12.5466 21.9333 12.5466 22.04 12.6533H22.0267Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="rocket-clip">
          <rect width="32" height="32" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

// Docs-only args type: Select's own props plus the SelectTrigger/SelectItem
// props we want documented in this single table, since they live on
// different sub-components and Meta<typeof Select> alone can't see them.
type SelectStoryArgs = React.ComponentProps<typeof Select> &
  Pick<SelectTriggerProps, 'widthSize' | 'error'> &
  Pick<SelectItemProps, 'icon' | 'iconSize' | 'status' | 'badge' | 'description'>;

const meta: Meta<SelectStoryArgs> = {
  title: 'Selection/Select',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Single-value picker on @radix-ui/react-select. Shares widthSize/heightSize/error conventions with TextField — the dropdown item text matches the trigger size too.' } },
  },
  argTypes: {
    heightSize: { control: 'radio', options: ['md', 'sm', 'lg'], description: 'md (default) 40px, body-m — sm 32px, body-s — lg 48px, body-m. Dropdown item text follows it too.', table: { category: 'Appearance' } },
    widthSize: {
      control: 'select',
      options: ['full', 'sm', 'md', 'lg', 'xl'],
      description: 'On SelectTrigger, not Select itself. m (default) 200px | s 60px | l 348px | xl 500px | full fills container.',
      table: { category: 'Appearance' },
    },
    error: {
      control: false,
      description: 'On SelectTrigger. Danger border+bg, stays visible while the popup is open too.',
      table: { category: 'State' },
    },
    icon: {
      control: false,
      description: 'On SelectItem. ReactNode shown before the item text — 16px by default.',
      table: { category: 'Content' },
    },
    iconSize: {
      control: 'radio',
      options: ['sm', 'lg'],
      description: "On SelectItem. sm (default) 16px inline icon | lg 32px media variant.",
      table: { category: 'Content' },
    },
    status: {
      control: 'select',
      options: ['success', 'warning', 'danger', 'neutral', 'primary', 'info'],
      description: 'On SelectItem. Colored dot in the icon slot — mutually exclusive with icon.',
      table: { category: 'Content' },
    },
    badge: {
      control: false,
      description: 'On SelectItem. { label, tone? } — pill shown after the text.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'On SelectItem. Second line under the text, smaller and subtler.',
      table: { category: 'Content' },
    },
  },
};

export default meta;
type Story = StoryObj<SelectStoryArgs>;

/** A labelled region picker with grouped options. */
export const Playground: Story = {
  args: { heightSize: 'md', widthSize: 'md', error: false },
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="region">Region</Label>
      <Select defaultValue="eu-west-1" heightSize={args.heightSize}>
        <SelectTrigger id="region" widthSize={args.widthSize} error={args.error}>
          <SelectValue placeholder="Select a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="eu-west-1">eu-west-1, Ireland</SelectItem>
            <SelectItem value="eu-central-1">eu-central-1, Frankfurt</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="us-east-1">us-east-1, Virginia</SelectItem>
            <SelectItem value="us-west-2">us-west-2, Oregon</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
  // The visible <Label> names the trigger, and the trigger shows the value.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Region' });
    await expect(trigger).toHaveTextContent('eu-west-1, Ireland');
  },
};

export const WithGroups: Story = {
  name: 'With groups',
  render: () => (
    <Select>
      <SelectTrigger widthSize="md" aria-label="Fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="potato">Potato</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  // Keyboard only: open with Enter, type-ahead, pick, focus returns; Escape cancels.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Fruit' });
    const body = within(document.body);

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const listbox = await body.findByRole('listbox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('c');
    await waitFor(() => expect(within(listbox).getByRole('option', { name: 'Carrot' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveTextContent('Carrot');
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await body.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveTextContent('Carrot');
  },
};

/** heightSize on the Select root drives both the trigger's own height/text size AND the dropdown item text size together. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Select heightSize="md">
        <SelectTrigger widthSize="md" aria-label="Medium select">
          <SelectValue placeholder="Medium (40px)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>
      <Select heightSize="sm">
        <SelectTrigger widthSize="md" aria-label="Small select">
          <SelectValue placeholder="Small (32px)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/** Long, unbreakable option values stay on screen: the content caps at the available width and clips overflow-x, so the overlay never forces horizontal scroll in a narrow trigger. */
export const LongOptions: Story = {
  name: 'Long options',
  render: () => (
    <Select>
      <SelectTrigger widthSize="lg" aria-label="Endpoint">
        <SelectValue placeholder="Choose an endpoint" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">shop.seashell.dev.eu-west-1.internal-lb-01.prod</SelectItem>
        <SelectItem value="b">api.seashell.dev.us-east-1.internal-lb-02.prod</SelectItem>
        <SelectItem value="c">docs.seashell.dev.ap-southeast-2.edge-03.staging</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** `error` pairs a danger border with a danger background, the same pairing TextField's own error variant uses. */
export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="plan-rest">Plan</Label>
      <Select>
        <SelectTrigger id="plan-rest" error widthSize="md">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="scale">Scale</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * An invalid Select keeps its danger border while its own popup is open —
 * the open state's neutral border and the danger one tie on specificity
 * unless the combined state is named explicitly, so this stays a
 * dedicated story rather than folding into `Invalid`.
 */
export const InvalidOpen: Story = {
  name: 'Invalid, open',
  // Story-only exception: while a Radix Select is open it is modal — it
  // sets aria-hidden on everything outside its portal (including
  // #storybook-root with the trigger in it) and keeps focus inside the
  // listbox. That's the intended pattern; axe flags aria-hidden-focus
  // only because this story renders the popup already open and scans the
  // hidden root. Same kind of confirmed-upstream exclusion as
  // NavigationMenu's; scoped to this one story.
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'aria-hidden-focus', enabled: false }],
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="plan-invalid">Plan</Label>
      <Select defaultOpen>
        <SelectTrigger id="plan-invalid" error widthSize="md" aria-label="Plan">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="scale">Scale</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger widthSize="md" aria-label="Disabled select">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** `icon` (16px) precedes the text; `iconSize="lg"` switches to the 32px media variant with a bold label — matches the two item kinds seen in the reference. */
export const WithIcons: Story = {
  name: 'With icons',
  render: () => (
    <Select defaultValue="a">
      <SelectTrigger widthSize="md" aria-label="Service">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a" icon={<Server />}>Compute</SelectItem>
        <SelectItem value="b" icon={<Cloud />}>Storage</SelectItem>
        <SelectItem value="c" icon={<Globe />}>Networking</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Media-icon variant: 32px icon, bold label. */
export const WithMediaIcons: Story = {
  name: 'With media icons',
  render: () => (
    <Select defaultValue="a" heightSize="lg">
      <SelectTrigger widthSize="md" aria-label="Launch template">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a" icon={<RocketIcon />} iconSize="lg">Standard launch</SelectItem>
        <SelectItem value="b" icon={<RocketIcon />} iconSize="lg">Fast-track deploy</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** `status` (colored dot) replaces `icon` in the same slot — for live/health state, not decoration. */
export const WithStatus: Story = {
  name: 'With status',
  render: () => (
    <Select defaultValue="a">
      <SelectTrigger widthSize="md" aria-label="Instance">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a" status="success">web-01 — running</SelectItem>
        <SelectItem value="b" status="warning">web-02 — degraded</SelectItem>
        <SelectItem value="c" status="danger">web-03 — stopped</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** `badge` renders a pill after the text, before the checkmark space. */
export const WithBadge: Story = {
  name: 'With badge',
  render: () => (
    <Select defaultValue="a">
      <SelectTrigger widthSize="md" aria-label="Assignee">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a" icon={<Server />} badge={{ label: 12 }}>Backend team</SelectItem>
        <SelectItem value="b" icon={<Cloud />} badge={{ label: 3, tone: 'warning' }}>Infra team</SelectItem>
        <SelectItem value="c" icon={<Globe />} badge={{ label: 'New', tone: 'success' }}>Growth team</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** `description` renders a smaller, subtler second line under the item text. */
export const WithDescription: Story = {
  name: 'With description',
  render: () => (
    <Select defaultValue="a" heightSize="lg">
      <SelectTrigger widthSize="lg" aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a" icon={<Server />} description="For solo projects and testing">
          Starter
        </SelectItem>
        <SelectItem value="b" icon={<Cloud />} description="For growing teams, up to 20 seats">
          Pro
        </SelectItem>
        <SelectItem value="c" icon={<Globe />} description="Custom limits, SSO, dedicated support">
          Enterprise
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};
