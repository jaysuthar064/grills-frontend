'use server';

const MIN_SUBMIT_MS = 2500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+\-()\s]+$/;

export interface CateringFormResult {
  status: 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

const CATERING_FALLBACK =
  'We could not submit your request online. Please call our catering team directly at 805-842-2947.';

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
    date: string;
    guests: string;
    type: string;
    notes: string;
  };
} {
  const values = {
    name: readString(formData, 'name'),
    email: readString(formData, 'email'),
    phone: readString(formData, 'phone'),
    date: readString(formData, 'date'),
    guests: readString(formData, 'guests'),
    type: readString(formData, 'type'),
    notes: readString(formData, 'notes'),
  };
  const fieldErrors: Record<string, string> = {};

  if (values.name.length < 2 || values.name.length > 80) {
    fieldErrors.name = 'Enter your name (2 to 80 characters).';
  }
  if (!EMAIL_RE.test(values.email) || values.email.length > 254) {
    fieldErrors.email = 'Enter a valid email address.';
  }
  if (!values.phone || values.phone.length < 7 || !PHONE_RE.test(values.phone)) {
    fieldErrors.phone = 'Enter a valid phone number.';
  }

  return { fieldErrors, values };
}

export async function submitCatering(
  _previous: CateringFormResult | null,
  formData: FormData,
): Promise<CateringFormResult> {
  const { fieldErrors, values } = validate(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Please fill in all required fields.',
      fieldErrors,
    };
  }

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
      const wpResponse = await fetch(`${wpBase}/wp-json/gotg/v1/submit-catering`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(values),
        cache: 'no-store',
      });

      if (wpResponse.ok) {
        const data = (await wpResponse.json().catch(() => null)) as { success?: boolean } | null;
        if (data && data.success) {
          return { status: 'success' };
        }
      }
    } catch (wpError) {
      console.warn('[submit-catering] WordPress FluentSMTP endpoint unreachable:', wpError);
    }
  }

  // 2. Fallback to Resend if configured
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
        subject: `Catering Inquiry from ${values.name}`,
        text: [
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Phone: ${values.phone}`,
          `Date: ${values.date || 'Not specified'}`,
          `Guests: ${values.guests || 'Not specified'}`,
          `Event Type: ${values.type || 'Not specified'}`,
          '',
          `Dietary / Notes:\n${values.notes || 'None'}`,
        ].join('\n'),
      }),
      cache: 'no-store',
    });

    if (response.ok) {
      return { status: 'success' };
    }
  }

  return { status: 'error', message: CATERING_FALLBACK };
}
