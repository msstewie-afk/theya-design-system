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
import { Password } from '@/components/ui/password';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WarningCircle } from 'iconoir-react';
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
    // "Select a engine" -> "Select an engine".
    const article = /^[aeiou]/i.test(field.label) ? 'an' : 'a';
    return required ? z.string().min(1, `Select ${article} ${field.label.toLowerCase()}.`) : z.string().optional();
  }

  let base = z.string();
  if (required) base = base.min(1, `${field.label} is required.`);
  if (kind === 'email') {
    const email = base.email('Enter a valid email.');
    // Optional emails default to '' — which .email() rejected, so an
    // empty optional email field blocked the submit.
    return required ? email : email.or(z.literal('')).optional();
  }
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

  const formId = useId();
  const form = useForm<ResourceFormValues>({
    // Cast: schema is built dynamically from a Record<string, ZodTypeAny>, so
    // zod infers a generic Record<string, unknown> shape that doesn't
    // nominally match our ResourceFormValues type, even though it matches
    // structurally at runtime.
    resolver: zodResolver(schema) as never,
    defaultValues,
    mode: 'onTouched',
    // react-hook-form focuses the first invalid field through the ref it
    // registered — but Select/NumberField/Switch go through Controller and
    // never hand it a ref, so an invalid select got no focus at all. Focus
    // by id instead, in on-screen order.
    shouldFocusError: false,
  });

  const handleSubmit = form.handleSubmit(
    async (values) => {
      await onSubmit(values);
    },
    (errors) => {
      const invalidFields = sections.flatMap((s) => s.fields).filter((f) => errors[f.name]);
      // One error: straight to the field. Several: to the summary at the
      // top, so the later ones aren't missed below the fold.
      if (invalidFields.length > 1) requestAnimationFrame(() => document.getElementById(summaryId)?.focus());
      else if (invalidFields[0]) document.getElementById(fieldId(formId, invalidFields[0].name))?.focus();
    },
  );

  const summaryId = `${formId}-error-summary`;
  const allFields = sections.flatMap((s) => s.fields);
  const errorFields = form.formState.submitCount > 0 ? allFields.filter((f) => form.formState.errors[f.name]) : [];

  return (
    <form onSubmit={handleSubmit} noValidate className={cn('flex w-full flex-col gap-6', className)}>
      {(title || description) && (
        <div className="min-w-0">
          {title && <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h2>}
          {description && <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</p>}
        </div>
      )}

      {/* Shown after a submit with 2+ errors and updated live as they're
          fixed; each item jumps to its field. Single errors don't need it. */}
      {errorFields.length > 1 && (
        <Alert id={summaryId} tabIndex={-1} tone="danger" live="assertive" className="outline-none focus-visible:focus-ring">
          <WarningCircle />
          {/* One wrapper: Alert lays its direct children out in a row, so a
              bare title + description sat side by side instead of stacked. */}
          <div className="min-w-0 flex-1">
            <AlertTitle>{`Fix ${errorFields.length} fields to continue`}</AlertTitle>
            <AlertDescription>
              <ul className="mt-1 flex list-none flex-col gap-2 pl-0">
                {errorFields.map((f) => (
                  <li key={f.name}>
                    <a
                      href={`#${fieldId(formId, f.name)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(fieldId(formId, f.name))?.focus();
                      }}
                      className="rounded-[var(--size-border-radius-border-radius-sm)] underline underline-offset-4 focus-visible:outline-none focus-visible:focus-ring"
                    >
                      {String(form.formState.errors[f.name]?.message ?? f.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </div>
        </Alert>
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
              <ResourceFormField key={field.name} field={field} form={form} id={fieldId(formId, field.name)} />
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
        <Button type="submit" appearance="filled" tone="primary" size="2xl" loading={form.formState.isSubmitting} className="max-sm:w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function fieldId(formId: string, name: string) {
  return `${formId}-${name}`;
}

function ResourceFormField({ field, form, id }: { field: ResourceFieldConfig; form: ReturnType<typeof useForm<ResourceFormValues>>; id: string }) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const kind = field.kind ?? 'text';
  const error = form.formState.errors[field.name]?.message as string | undefined;
  const invalid = Boolean(error);
  // The error text was only role="alert" (announced once as it appeared)
  // and never tied to the control, so returning to the field later read
  // no error at all (WCAG 3.3.1). It's now part of the description.
  const describedBy = [field.description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

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
              {error && <FieldError id={errorId}>{error}</FieldError>}
            </div>
            <Switch id={id} checked={Boolean(controllerField.value)} onCheckedChange={controllerField.onChange} aria-describedby={describedBy} aria-invalid={invalid} className="mt-0.5 shrink-0" />
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
            <Label htmlFor={id} required={field.required} optional={!field.required}>
              {field.label}
            </Label>
            <Select value={String(controllerField.value ?? '')} onValueChange={controllerField.onChange}>
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid} error={invalid} widthSize="lg">
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
            {error && <FieldError id={errorId}>{error}</FieldError>}
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
            <Label htmlFor={id} required={field.required} optional={!field.required}>
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
              aria-describedby={describedBy}
              aria-invalid={invalid}
              widthSize="md"
            />
            {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
            {error && <FieldError id={errorId}>{error}</FieldError>}
          </Field>
        )}
      />
    );
  }

  if (kind === 'textarea') {
    return (
      <Field invalid={invalid} required={field.required}>
        <Label htmlFor={id} required={field.required} optional={!field.required}>
          {field.label}
        </Label>
        <TextArea id={id} rows={field.rows} widthSize="lg" placeholder={field.placeholder} aria-describedby={describedBy} aria-invalid={invalid} error={invalid} {...form.register(field.name)} />
        {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  }

  if (kind === 'password') {
    return (
      <Field invalid={invalid} required={field.required}>
        <Label htmlFor={id} required={field.required} optional={!field.required}>
          {field.label}
        </Label>
        <Password id={id} autoComplete="new-password" placeholder={field.placeholder} aria-describedby={describedBy} aria-invalid={invalid} error={invalid} widthSize="lg" {...form.register(field.name)} />
        {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  }

  const nativeType = kind === 'email' ? 'email' : 'text';
  const autoComplete = kind === 'email' ? 'email' : undefined;

  return (
    <Field invalid={invalid} required={field.required}>
      <Label htmlFor={id} required={field.required} optional={!field.required}>
        {field.label}
      </Label>
      <TextField
        id={id}
        type={nativeType}
        autoComplete={autoComplete}
        placeholder={field.placeholder}
        className={field.mono ? 'font-mono' : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        error={invalid}
        widthSize="lg"
        {...form.register(field.name)}
      />
      {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
}
