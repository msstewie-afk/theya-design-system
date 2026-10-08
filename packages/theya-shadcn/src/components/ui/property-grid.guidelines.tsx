import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { PropertyGrid } from './property-grid';

export const propertyGridGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Viewing and editing an object’s properties in a compact two-column list: an inspector panel, a resource’s settings, a selected item’s details.', <><C>readOnly</C> items for values people see but can’t change.</>],
  whenNotToUse: [
    { text: 'A form people fill once (sign-up, checkout)', instead: 'a stacked form (TextField, Form)' },
    { text: 'Read-only facts with no editing', instead: 'DescriptionList' },
    { text: 'Many records with the same fields', instead: 'DataTable' },
  ],
  anatomy: [
    { part: 'Label column', description: <>sized to the longest label, capped by <C>maxLabelWidth</C>; long labels wrap.</> },
    { part: 'Value column', description: <>control per <C>type</C>: text, number, select, switch, textarea, custom.</> },
    { part: 'Rows', description: 'separated by a Separator; description under the control.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-96 max-w-full">
            <PropertyGrid
              id="gl-pg"
              items={[
                { name: 'name', label: 'Display name', type: 'text' },
                { name: 'replicas', label: 'Replicas', type: 'number' },
                { name: 'public', label: 'Public URL', type: 'switch' },
                { name: 'id', label: 'Resource ID', type: 'text', readOnly: true },
              ]}
              defaultValues={{ name: 'shop-api', replicas: 3, public: true, id: 'res_8f2k1' }}
            />
          </div>
        ),
        caption: 'An object’s properties, scanned and tweaked in place.',
      },
      dont: {
        example: (
          <div className="w-96 max-w-full">
            <PropertyGrid
              id="gl-pg-signup"
              items={[
                { name: 'email', label: 'Email', type: 'text' },
                { name: 'company', label: 'Company name', type: 'text' },
                { name: 'about', label: 'Tell us about your project', type: 'textarea' },
              ]}
            />
          </div>
        ),
        caption: 'A sign-up form as a grid: labels squeezed left, no room for help or errors — stack it instead.',
      },
    },
  ],
  a11y: [
    'Each label is a real label for its control; the grid is not a table to screen readers.',
    'Read-only values render as plain text (a read-only switch as a disabled switch), so they read and copy like any text.',
  ],
};
