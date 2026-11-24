import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { MapView, type MapPoint } from './map-view';
import { mapViewGuidelines } from './map-view.guidelines';
import { Button } from './button';
import { STUDIOS } from '../../stories/demo';

/**
 * MapView — places on a MapLibre map whose base map is drawn from Theya
 * tokens (light / dark / product theme), with clusters, a card over the map
 * and a list of the same places next to it. Demo: Aether print pickup
 * points in Lisbon.
 */

const LISBON_POINTS: MapPoint[] = [
  { id: 'helios', name: STUDIOS.helios.name, address: 'Rua da Prata 112, Baixa', lng: -9.1369, lat: 38.7106 },
  { id: 'selene', name: STUDIOS.selene.name, address: 'Rua do Norte 21, Bairro Alto', lng: -9.1454, lat: 38.7128 },
  { id: 'eos', name: STUDIOS.eos.name, address: 'Largo do Intendente 9', lng: -9.1352, lat: 38.7224 },
  { id: 'phoebe', name: STUDIOS.phoebe.name, address: 'Rua de São Bento 300', lng: -9.1543, lat: 38.7166 },
  { id: 'othrys', name: STUDIOS.othrys.name, address: 'Avenida da Índia 40, Belém', lng: -9.2036, lat: 38.6969 },
  { id: 'l4', name: STUDIOS.l4.name, address: 'Rua do Açúcar 64, Beato', lng: -9.1047, lat: 38.7351 },
  { id: 'pickup-chiado', name: 'Pickup · Chiado', address: 'Rua Garrett 50', lng: -9.1421, lat: 38.7108 },
  { id: 'pickup-alfama', name: 'Pickup · Alfama', address: 'Rua dos Remédios 34', lng: -9.1288, lat: 38.7123 },
  { id: 'pickup-graca', name: 'Pickup · Graça', address: 'Largo da Graça 18', lng: -9.1309, lat: 38.7169 },
  { id: 'pickup-saldanha', name: 'Pickup · Saldanha', address: 'Avenida da República 15', lng: -9.1452, lat: 38.7348 },
  { id: 'pickup-alvalade', name: 'Pickup · Alvalade', address: 'Avenida da Igreja 27', lng: -9.1428, lat: 38.7531 },
  { id: 'pickup-campo-ourique', name: 'Pickup · Campo de Ourique', address: 'Rua Ferreira Borges 88', lng: -9.1648, lat: 38.7179 },
];

const meta = {
  title: 'Data/MapView',
  component: MapView,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Places on a map — points, clusters, a card for the selected place — with the same places as a list next to it. The base map takes its colors from the theme.',
      },
    },
    layout: 'padded',
    guidelines: mapViewGuidelines,
    // The base map and marker positions come from live tiles and WebGL.
    visual: { mask: ['[data-slot=map-view-canvas]'] },
  },
  args: { points: LISBON_POINTS, 'aria-label': 'Aether pickup points', listTitle: 'Pickup points' },
} satisfies Meta<typeof MapView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Points in the primary color, clusters with a count, zoom buttons, the list with "Find near me". */
export const Default: Story = {};

/** A place selected from the start: the map flies to it and the card opens. */
export const Selected: Story = {
  args: { defaultSelectedId: 'eos' },
};

/** Distances from a known origin (here the user's saved address): the list is sorted, the card says how far. */
export const WithOrigin: Story = {
  args: { origin: { lng: -9.1393, lat: 38.7223 }, defaultSelectedId: 'pickup-graca' },
};

/** A card of your own over the map: a short pitch and an action, like a restaurant chain's "find near me". */
export const CustomCard: Story = {
  args: {
    defaultSelectedId: 'helios',
    renderCard: (p, distance) => (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">{p.name}</p>
          <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">
            {p.address}
            {distance ? ` · ${distance}` : ''}
          </p>
          <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">Prints ready in 2 hours. Open until 20:00.</p>
        </div>
        <Button size="sm" className="self-start">
          Get directions
        </Button>
      </div>
    ),
  },
};

/** The list on the start side, miles instead of kilometers. */
export const ListStart: Story = {
  args: { list: 'start', unit: 'mile', origin: { lng: -9.1393, lat: 38.7223 } },
};

/**
 * No base map (`tiles={null}`): only the points on the land color. For
 * tests and for a page that can't load map tiles; the same story checks
 * the keyboard path.
 */
export const NoBaseMap: Story = {
  args: { tiles: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Pickup points' });
    const rows = within(list).getAllByRole('button');
    expect(rows).toHaveLength(LISBON_POINTS.length);
    // Keyboard: Tab to a place in the list and press Enter — the card opens.
    rows[2].focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('group', { name: STUDIOS.eos.name })).toBeVisible());
    expect(rows[2]).toHaveAttribute('aria-pressed', 'true');
    // The card closes from its own button; the place is no longer selected.
    await userEvent.click(within(canvas.getByRole('group', { name: STUDIOS.eos.name })).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(canvas.queryByRole('group', { name: STUDIOS.eos.name })).toBeNull());
    expect(rows[2]).toHaveAttribute('aria-pressed', 'false');
    // Zoom buttons are named.
    expect(canvas.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
  },
};
