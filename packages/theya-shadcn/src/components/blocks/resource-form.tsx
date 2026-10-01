import { useId, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Controller, useForm, type ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, type ZodTypeAny } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';
import { TextArea } from '@/components/ui/textarea';
import { NumberField } from '@/components/ui/number-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

/**
 * A config-driven create/edit resource form: pass a list of field
 * definitions (grouped into sections) and the block builds the zod
 * validation schema, wires react-hook-form, and renders each field
 * through the shared Field/Label/FieldDescription/FieldError
 * pieces. Non-native controls (Select/Switch/NumberField) render
 * through react-hook-form's Controller; native text kinds use
 * `register` directly through our TextField/TextArea.
 *
 *   <ResourceForm
 *     title="Create database"
 *     sections={[{ fields: [
 *       { name: "name", label: "Name", required: true },
 *       { name: "engine", label: "Engine", kind: "select", options: [...] },
 *     ] }]}
 *     onSubmit={(values) => createDatabase(values)}
 *   />
 */
export type ResourceFieldKind = 'text' | 'email' | 'password' | 'textarea' | 'number' | 'select' | 'switch';

export interface ResourceFieldOption {
  value: string;
  label: string;
}

export interface ResourceFieldConfig {
  name: string;
  label: string;
  kind?: ResourceFieldKind;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  /** Options for kind="select". */
  options?: ResourceFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  /** Visible rows for kind="textarea". */
  rows?: number;
  /** Identifiers/numerics read in monospace for kind="text". */
  mono?: boolean;
  defaultValue?: string | number | boolean;
}

export interface ResourceFormSection {
  title?: string;
  description?: ReactNode;
  fields: ResourceFieldConfig[];
}

export type ResourceFormValues = Record<string, string | number | boolean>;

export interface ResourceFormProps {
  title?: string;
  description?: ReactNode;
  sections: ResourceFormSection[];
  onSubmit: (values: ResourceFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

function fieldSchema(field: ResourceFieldConfig): ZodTypeAny {
  const kind = field.kind ?? 'text';
  const required = field.required ?? false;

  if (kind === 'switch') return z.boolean();

  if (kind === 'number') {
    const base = z.coerce.number({ message: `${field.label} must be a number.` });
    const withMin = field.min != null ? base.min(field.min, `${field.label} must be at least ${field.min}.`) : base;
    const withMax = field.max != null ? withMin.max(field.max, `${field.label} must be at most ${field.max}.`) : withMin;
    return required ? withMax : withMax.optional();
  }

  if (kind === 'select') {
    return required ? z.string().min(1, `Select a ${field.label.toLowerCase()}.`) : z.string().optional();
  }

  let base = z.string();
  if (kind === 'email') base = base.email(`Enter a valid email.`);
  if (required) base = base.min(1, `${field.label} is required.`);
  return required ? base : base.optional();
}

function buildSchema(sections: ResourceFormSection[]) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const section of sections) {
    for (const field of section.fields) shape[field.name] = fieldSchema(field);
  }
  return z.object(shape);
}

function buildDefaults(sections: ResourceFormSection[]): ResourceFormValues {
  const defaults: ResourceFormValues = {};
  for (const section of sections) {
    for (const field of section.fields) {
      const kind = field.kind ?? 'text';
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      } else if (kind === 'switch') {
        defaults[field.name] = false;
      } else if (kind === 'number') {
        defaults[field.name] = field.min ?? 0;
      } else {
        defaults[field.name] = '';
      }
    }
  }
  return defaults;
}

export function ResourceForm({ title, description, sections, onSubmit, onCancel, submitLabel = 'Save', cancelLabel = 'Cancel', className }: ResourceFormProps) {
  const schema = useMemo(() => buildSchema(sections), [sections]);
  const defaultValues = useMemo(() => buildDefaults(sections), [sections]);

  const form = useForm<ResourceFormValues>({
    // Cast: schema is built dynamically from a Record<string, ZodTypeAny>, so
    // zod infers a generic Record<string, unknown> shape that doesn't
    // nominally match our ResourceFormValues type, even though it matches
    // structurally at runtime.
    resolver: zodResolver(schema) as never,
    defaultValues,
    mode: 'onTouched',
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit} noValidate className={cn('flex w-full flex-col gap-6', className)}>
      {(title || description) && (
        <div className="min-w-0">
          {title && <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h2>}
          {description && <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</p>}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {sections.map((section, si) => (
          <div key={section.title ?? si} className="flex flex-col gap-4">
            {si > 0 && <Separator />}
            {(section.title || section.description) && (
              <div className="min-w-0">
                {section.title && <h3 className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{section.title}</h3>}
                {section.description && <p className="mt-0.5 font-body text-body-s text-[var(--color-text-text-subtler)]">{section.description}</p>}
              </div>
            )}
            {section.fields.map((field) => (
              <ResourceFormField key={field.name} field={field} form={form} />
            ))}
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button appearance="outlined" tone="secondary" size="2xl" onClick={onCancel} className="max-sm:w-full">
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" appearance="filled" tone="primary" size="2xl" disabled={form.formState.isSubmitting} className="max-sm:w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function ResourceFormField({ field, form }: { field: ResourceFieldConfig; form: ReturnType<typeof useForm<ResourceFormValues>> }) {
  const id = useId();
  const descriptionId = useId();
  const kind = field.kind ?? 'text';
  const error = form.formState.errors[field.name]?.message as string | undefined;
  const invalid = Boolean(error);

  if (kind === 'switch') {
    return (
      <Controller
        control={form.control}
        name={field.name}
        render={({ field: controllerField }) => (
          <Field invalid={invalid} required={field.required} className="flex-row items-start justify-between gap-4">
            <div className="min-w-0">
              <Label htmlFor={id} required={field.required}>
                {field.label}
              </Label>
              {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
              {error && <FieldError>{error}</FieldError>}
            </div>
            <Switch id={id} checked={Boolean(controllerField.value)} onCheckedChange={controllerField.onChange} aria-describedby={field.description ? descriptionId : undefined} aria-invalid={invalid} className="mt-0.5 shrink-0" />
          </Field>
        )}
      />
    );
  }

  if (kind === 'select') {
    return (
      <Controller
        control={form.control}
        name={field.name}
        render={({ field: controllerField }) => (
          <Field invalid={invalid} required={field.required}>
            <Label htmlFor={id} required={field.required}>
              {field.label}
            </Label>
            <Select value={String(controllerField.value ?? '')} onValueChange={controllerField.onChange}>
              <SelectTrigger id={id} aria-describedby={field.description ? descriptionId : undefined} aria-invalid={invalid} error={invalid} widthSize="lg">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
            {error && <FieldError>{error}</FieldError>}
          </Field>
        )}
      />
    );
  }

  if (kind === 'number') {
    return (
      <Controller
        control={form.control}
        name={field.name}
        render={({ field: controllerField }) => (
          <Field invalid={invalid} required={field.required}>
            <Label htmlFor={id} required={field.required}>
              {field.label}
            </Label>
            <NumberField
              id={id}
              value={typeof controllerField.value === 'number' ? controllerField.value : undefined}
              onValueChange={controllerField.onChange}
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={field.placeholder}
              aria-describedby={field.description ? descriptionId : undefined}
              aria-invalid={invalid}
              widthSize="md"
            />
            {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
            {error && <FieldError>{error}</FieldError>}
          </Field>
        )}
      />
    );
  }

  if (kind === 'textarea') {
    return (
      <Field invalid={invalid} required={field.required}>
        <Label htmlFor={id} required={field.required}>
          {field.label}
        </Label>
        <TextArea id={id} rows={field.rows} widthSize="lg" placeholder={field.placeholder} aria-describedby={field.description ? descriptionId : undefined} aria-invalid={invalid} error={invalid} {...form.register(field.name)} />
        {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  }

  const nativeType = kind === 'email' ? 'email' : kind === 'password' ? 'password' : 'text';
  const autoComplete = kind === 'email' ? 'email' : kind === 'password' ? 'new-password' : undefined;

  return (
    <Field invalid={invalid} required={field.required}>
      <Label htmlFor={id} required={field.required}>
        {field.label}
      </Label>
      <TextField
        id={id}
        type={nativeType}
        autoComplete={autoComplete}
        placeholder={field.placeholder}
        className={field.mono ? 'font-mono' : undefined}
        aria-describedby={field.description ? descriptionId : undefined}
        aria-invalid={invalid}
        error={invalid}
        widthSize="lg"
        {...form.register(field.name)}
      />
      {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
