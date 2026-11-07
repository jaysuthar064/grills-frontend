'use server';

/*
 * Contact form Server Action — 09-INTEGRATIONS.md §5. The delivery vendor
 * (Resend) is DECIDED but "pending client approval", and its API key / DNS are
 * not configured, so the live send path is present but guarded:
 *
 *   - env configured  → POST to the Resend REST API (the documented flow).
 *   - env absent       → STUB: no vendor call, return an error that tells the
 *                        user to call or email instead. See the TODO below.
 *
 * This keeps the API key out of the browser bundle and never invents a backend.
 * Validation, the honeypot, and the 3-second minimum-time check run regardless
 * of delivery status. Server-side validation mirrors 09's ContactSchema; zod is
 * not a project dependency, so the checks are written out rather than imported.
 *
 * TODO(DP-18 / Resend approval): once RESEND_API_KEY, CONTACT_FORM_TO, and
 * CONTACT_FORM_FROM are set (recipient currently
 * grillonthegreensimivalley@gmail.com, flagged as may-change), the env-absent
 * branch below can be removed and delivery is live with no other change.
 */

const MIN_SUBMIT_MS = 3000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+\-()\s]+$/;

export interface ContactFormResult {
  status: 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

const CONTACT_FALLBACK =
  'We could not send your message. Please call 805-842-2947 or email us directly.';

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function validate(formData: FormData): {
  fieldErrors: Record<string, string>;
  values: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };
} {
  const values = {
    name: readString(formData, 'name'),
    email: readString(formData, 'email'),
    phone: readString(formData, 'phone'),
    subject: readString(formData, 'subject'),
    message: readString(formData, 'message'),
  };
  const consent = readString(formData, 'consent');
  const fieldErrors: Record<string, string> = {};

  if (values.name.length < 2 || values.name.length > 80) {
    fieldErrors.name = 'Enter your name (2 to 80 characters).';
  }
  if (!EMAIL_RE.test(values.email) || values.email.length > 254) {
    fieldErrors.email = 'Enter an email address like name@example.com.';
  }
  if (
    values.phone !== '' &&
    (values.phone.length < 10 ||
      values.phone.length > 20 ||
      !PHONE_RE.test(values.phone))
  ) {
    fieldErrors.phone =
      'Enter a phone number using digits and + - ( ) only, or leave it blank.';
  }
  if (values.subject.length < 1 || values.subject.length > 60) {
    fieldErrors.subject = 'Choose a subject.';
  }
  if (values.message.length < 10 || values.message.length > 2000) {
    fieldErrors.message = 'Enter a message of at least 10 characters.';
  }
  if (consent !== 'on') {
    fieldErrors.consent = 'Please agree before sending.';
  }

  return { fieldErrors, values };
}

export async function submitContact(
  _previous: ContactFormResult | null,
  formData: FormData,
): Promise<ContactFormResult> {
  const { fieldErrors, values } = validate(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Please correct the fields below.',
      fieldErrors,
    };
  }

  // Spam defences (09 §5): a filled honeypot or a sub-3s submit is treated as a
  // bot and silently accepted — telling it that it was caught teaches evasion.
  const honeypot = readString(formData, 'company');
  const startedAt = Number(readString(formData, 'startedAt'));

  if (honeypot !== '') {
    return { status: 'success' };
  }
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_SUBMIT_MS) {
    return { status: 'success' };
  }

  // 1. Try WordPress Backend via FluentSMTP (wp_mail)
  const wpBase =
    process.env.WP_API_BASE_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_URL;

  if (wpBase) {
    try {
      const wpResponse = await fetch(`${wpBase}/wp-json/gotg/v1/submit-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          subject: values.subject,
          message: values.message,
        }),
        cache: 'no-store',
      });

      if (wpResponse.ok) {
        const data = (await wpResponse.json().catch(() => null)) as { success?: boolean } | null;
        if (data && data.success) {
          return { status: 'success' };
        }
      }
    } catch (wpError) {
      console.warn('[submit-contact] WordPress FluentSMTP endpoint unreachable, checking fallbacks:', wpError);
    }
  }

  // 2. Fallback to Resend API if configured
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_FORM_TO;
  const from = process.env.CONTACT_FORM_FROM;

  if (apiKey && to && from) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: values.email,
        subject: `Website enquiry: ${values.subject}`,
        text: [
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Phone: ${values.phone === '' ? 'Not provided' : values.phone}`,
          `Subject: ${values.subject}`,
          '',
          values.message,
        ].join('\n'),
      }),
      cache: 'no-store',
    });

    if (response.ok) {
      return { status: 'success' };
    }
  }

  // If WordPress or Resend succeeded, it already returned above.
  // Otherwise surface actionable error:
  return { status: 'error', message: CONTACT_FALLBACK };
}
