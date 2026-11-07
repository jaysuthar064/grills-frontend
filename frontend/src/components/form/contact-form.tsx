'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { submitContact } from '@/actions/submit-contact';
import { Text } from '@/components/primitives/text';

import { Checkbox, Honeypot, Select, TextArea, TextInput } from './controls';
import { Field } from './field';
import { FormSuccess } from './form-success';

/*
 * ContactForm — 06-COMPONENT-SPEC.md §ContactForm. The only client module in the
 * contact page. Owns validation state, error/success state, and focus.
 *
 * Validation timing (06): on submit first; a field that has failed once then
 * re-validates on blur; never on keystroke. Submission posts to the
 * `submitContact` Server Action (09 §5) via useActionState, so no API key is in
 * the bundle. The 3-second minimum-time honeypot timestamp is set at mount.
 *
 * Focus: on a failed submit, focus moves to the error summary (role="alert",
 * listing each failed field as a link to it); on success, focus moves to the
 * confirmation (role="status").
 */

export interface ContactFormProps {
  subjects: string[];
  recipientLabel?: string;
  defaultSubject?: string;
}

const CONTROL_MIN_HEIGHT: CSSProperties = {
  minHeight: 'var(--control-height-md)',
};

const FIELD_LABEL: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  subject: 'Subject',
  message: 'Message',
  consent: 'Consent',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+\-()\s]+$/;

function get(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function computeErrors(
  formData: FormData,
  subjects: string[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = get(formData, 'name');
  const email = get(formData, 'email');
  const phone = get(formData, 'phone');
  const subject = get(formData, 'subject');
  const message = get(formData, 'message');
  const consent = get(formData, 'consent');

  if (name.length < 2 || name.length > 80) {
    errors.name = 'Enter your name (2 to 80 characters).';
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    errors.email = 'Enter an email address like name@example.com.';
  }
  if (
    phone !== '' &&
    (phone.length < 10 || phone.length > 20 || !PHONE_RE.test(phone))
  ) {
    errors.phone =
      'Enter a phone number using digits and + - ( ) only, or leave it blank.';
  }
  if (subject === '' || !subjects.includes(subject)) {
    errors.subject = 'Choose a subject.';
  }
  if (message.length < 10 || message.length > 2000) {
    errors.message = 'Enter a message of at least 10 characters.';
  }
  if (consent !== 'on') {
    errors.consent = 'Please agree before sending.';
  }

  return errors;
}

export function ContactForm({
  subjects,
  recipientLabel,
  defaultSubject,
}: ContactFormProps): ReactNode {
  const [result, formAction, isPending] = useActionState(submitContact, null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(defaultSubject ?? '');
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('booking')) {
        const bookingSubj = subjects.find(
          (s) => s.toLowerCase().includes('music') || s.toLowerCase().includes('booking'),
        );
        if (bookingSubj) {
          setSelectedSubject(bookingSubj);
        }
      }
    }
  }, [subjects]);

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const subjectOptions = useMemo(
    () => [
      { value: '', label: 'Select a subject…' },
      ...subjects.map((subject) => ({ value: subject, label: subject })),
    ],
    [subjects],
  );

  const serverFieldErrors =
    result?.status === 'error' ? result.fieldErrors : undefined;
  const errors = serverFieldErrors ?? clientErrors;
  const errorEntries = Object.entries(errors).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  const summaryMessage =
    result?.status === 'error'
      ? (result.message ?? 'Please correct the fields below.')
      : errorEntries.length > 0
        ? 'Please correct the fields below.'
        : undefined;

  // Move focus to the confirmation on success, or the error summary on a
  // server-reported error.
  useEffect(() => {
    if (result?.status === 'success') {
      successRef.current?.focus();
    } else if (result?.status === 'error') {
      summaryRef.current?.focus();
    }
  }, [result]);

  // Move focus to the summary after a client-side validation block.
  useEffect(() => {
    if (submitAttempt > 0) {
      summaryRef.current?.focus();
    }
  }, [submitAttempt]);

  function revalidate(fieldName: string): void {
    if (!failedFields.has(fieldName) || formRef.current === null) {
      return;
    }
    const found = computeErrors(new FormData(formRef.current), subjects);
    setClientErrors((previous) => {
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(previous)) {
        if (key !== fieldName) {
          next[key] = value;
        }
      }
      const current = found[fieldName];
      if (typeof current === 'string') {
        next[fieldName] = current;
      }
      return next;
    });
  }

  if (result?.status === 'success') {
    return (
      <div ref={successRef} tabIndex={-1} role="status">
        <FormSuccess headingId="contact-success-heading" />
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(event) => {
        const found = computeErrors(
          new FormData(event.currentTarget),
          subjects,
        );
        if (Object.keys(found).length > 0) {
          event.preventDefault();
          setClientErrors(found);
          setFailedFields(new Set(Object.keys(found)));
          setSubmitAttempt((count) => count + 1);
        } else {
          setClientErrors({});
        }
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      {summaryMessage !== undefined ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="flex flex-col gap-2 rounded-md border-2 border-danger bg-surface-raised p-4"
        >
          <Text weight="semibold">{summaryMessage}</Text>
          {errorEntries.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {errorEntries.map(([fieldName, fieldMessage]) => (
                <li key={fieldName}>
                  <a
                    href={`#${fieldName}`}
                    className="font-body text-body-sm text-danger underline"
                  >
                    {FIELD_LABEL[fieldName] ?? fieldName}: {fieldMessage}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Field label="Name" name="name" required error={errors.name}>
        <TextInput
          name="name"
          autoComplete="name"
          readOnly={isPending}
          hasError={errors.name !== undefined}
          onBlur={() => {
            revalidate('name');
          }}
        />
      </Field>

      <Field label="Email" name="email" required error={errors.email}>
        <TextInput
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          readOnly={isPending}
          hasError={errors.email !== undefined}
          onBlur={() => {
            revalidate('email');
          }}
        />
      </Field>

      <Field
        label="Phone"
        name="phone"
        hint="Optional — the fastest way for us to reach you."
        error={errors.phone}
      >
        <TextInput
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          readOnly={isPending}
          hasError={errors.phone !== undefined}
          onBlur={() => {
            revalidate('phone');
          }}
        />
      </Field>

      <Field label="Subject" name="subject" required error={errors.subject}>
        <Select
          name="subject"
          options={subjectOptions}
          value={selectedSubject}
          onChange={(event) => {
            setSelectedSubject(event.target.value);
            revalidate('subject');
          }}
          required
          disabled={isPending}
          hasError={errors.subject !== undefined}
        />
      </Field>

      <Field label="Message" name="message" required error={errors.message}>
        <TextArea
          name="message"
          rows={6}
          maxLength={2000}
          value={message}
          readOnly={isPending}
          hasError={errors.message !== undefined}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
          onBlur={() => {
            revalidate('message');
          }}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <Checkbox
          name="consent"
          label="I agree to be contacted about this enquiry."
          hasError={errors.consent !== undefined}
          disabled={isPending}
          aria-invalid={errors.consent !== undefined ? true : undefined}
          aria-describedby={
            errors.consent !== undefined ? 'consent-error' : undefined
          }
        />
        {errors.consent !== undefined ? (
          <p
            id="consent-error"
            role="alert"
            className="font-body text-body-sm text-danger"
          >
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Honeypot />
      <input type="hidden" name="startedAt" defaultValue={String(startedAt)} />

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={isPending}
          style={CONTROL_MIN_HEIGHT}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 font-body font-semibold text-ink-inverse transition-colors hover:bg-brand-hover active:translate-y-px disabled:bg-surface-sunken disabled:text-ink-subtle"
        >
          {isPending ? 'Sending…' : 'Send message'}
        </button>
        {recipientLabel !== undefined ? (
          <Text size="caption" tone="muted">
            Your message goes to {recipientLabel}.
          </Text>
        ) : null}
      </div>
    </form>
  );
}
