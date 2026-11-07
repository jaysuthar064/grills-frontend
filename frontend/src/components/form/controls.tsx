import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

/*
 * Form controls — 06-COMPONENT-SPEC.md §TextInput/TextArea/Select/Checkbox. Dumb
 * presentational inputs with no state of their own, so the only client module in
 * the contact form is ContactForm. Each accepts `hasError` for the error border
 * and spreads the remaining HTML attributes (including the `id`,
 * `aria-describedby`, and `aria-invalid` that Field injects) onto the native
 * element.
 *
 * Colour, radius, and border come entirely from tokens; the 44px minimum height
 * is the --control-height-md token applied as min-height (no h-* step exists for
 * it, matching LinkButton).
 */

const CONTROL_MIN_HEIGHT: CSSProperties = {
  minHeight: 'var(--control-height-md)',
};

function controlClasses(hasError: boolean): string {
  return cn(
    'w-full rounded-md bg-surface-raised px-3 py-2 font-body text-body text-ink',
    'transition-colors placeholder:text-ink-subtle',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-interactive focus-visible:border-border-interactive',
    'disabled:bg-surface-sunken disabled:text-ink-subtle',
    hasError
      ? 'border-2 border-danger'
      : 'border border-border-strong',
  );
}

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  name: string;
  type?: 'text' | 'email' | 'tel';
  hasError?: boolean;
}

export function TextInput({
  name,
  type = 'text',
  hasError = false,
  ...rest
}: TextInputProps): ReactNode {
  return (
    <input
      name={name}
      type={type}
      className={controlClasses(hasError)}
      style={CONTROL_MIN_HEIGHT}
      {...rest}
    />
  );
}

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  name: string;
  rows?: number;
  maxLength?: number;
  hasError?: boolean;
}

export function TextArea({
  name,
  rows = 6,
  maxLength,
  hasError = false,
  value,
  ...rest
}: TextAreaProps): ReactNode {
  const length = typeof value === 'string' ? value.length : 0;
  // The counter is announced only once the field is near its limit, so it does
  // not chatter on every keystroke (06 §TextArea).
  const showCounter =
    maxLength !== undefined && length >= Math.floor(maxLength * 0.8);

  return (
    <div className="flex flex-col gap-1">
      <textarea
        name={name}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={controlClasses(hasError)}
        {...rest}
      />
      {maxLength !== undefined ? (
        <p
          aria-live="polite"
          className="text-right font-body text-caption text-ink-subtle"
        >
          {showCounter ? `${String(length)} / ${String(maxLength)}` : null}
        </p>
      ) : null}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  name: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  hasError?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-describedby'?: string | undefined;
  'aria-invalid'?: boolean | undefined;
}

export function Select({
  name,
  options,
  value,
  defaultValue,
  hasError = false,
  ...rest
}: SelectProps): ReactNode {
  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      className={controlClasses(hasError)}
      style={CONTROL_MIN_HEIGHT}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export interface CheckboxProps {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-describedby'?: string | undefined;
  'aria-invalid'?: boolean | undefined;
}

export function Checkbox({
  name,
  label,
  defaultChecked,
  hasError = false,
  id,
  ...rest
}: CheckboxProps): ReactNode {
  const inputId = id ?? name;
  return (
    <div className="flex items-start gap-3">
      <input
        id={inputId}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className={cn(
          'mt-1 size-5 shrink-0 rounded-sm border bg-surface-raised accent-brand',
          hasError ? 'border-2 border-danger' : 'border-border-strong',
        )}
        {...rest}
      />
      <label htmlFor={inputId} className="font-body text-body text-ink">
        {label}
      </label>
    </div>
  );
}

/*
 * Honeypot — an off-screen field bots fill and humans never see. Hidden by
 * position, not display:none, since some bots skip display:none fields. Removed
 * from the tab order and the accessibility tree.
 */
const HONEYPOT_STYLE: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
};

export function Honeypot(): ReactNode {
  return (
    <div style={HONEYPOT_STYLE} aria-hidden="true">
      <label htmlFor="company">Company (leave this field empty)</label>
      <input
        id="company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
