'use client';

import { useActionState, useState } from 'react';
import type { ReactNode } from 'react';

import { submitCatering } from '@/actions/submit-catering';
import { Heading } from '@/components/primitives/heading';

export function CateringForm(): ReactNode {
  const [result, formAction, isPending] = useActionState(submitCatering, null);
  const [startedAt] = useState(() => Date.now());

  if (result?.status === 'success') {
    return (
      <div className="bg-surface-raised rounded-2xl p-8 border border-border shadow-md flex flex-col gap-4 text-center items-center py-12">
        <div className="h-14 w-14 rounded-full bg-emerald-950/20 text-emerald-600 flex items-center justify-center text-2xl font-bold border border-emerald-500/30">
          ✓
        </div>
        <Heading level={3} visualLevel="h3" className="text-ink">
          Catering Request Received!
        </Heading>
        <p className="text-body text-ink-muted max-w-md leading-relaxed">
          Thank you! We have received your event details. Marco and our catering director will review your headcount and date, and reach out within 24 hours.
        </p>
        <p className="text-caption text-ink-muted">
          Need immediate assistance? Call our catering team directly at{' '}
          <a href="tel:+18058422947" className="text-brand-primary font-bold hover:underline">
            805-842-2947
          </a>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-raised rounded-2xl p-8 border border-border shadow-md">
      <form action={formAction} className="flex flex-col gap-5">
        <Heading level={3} visualLevel="h3">
          Catering Inquiry Form
        </Heading>

        {/* Spam honeypot & timing */}
        <div className="hidden" aria-hidden="true">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          <input type="hidden" name="startedAt" value={startedAt} />
        </div>

        {result?.status === 'error' && result.message ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
            {result.message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-body-sm font-semibold text-ink">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary text-ink"
            />
            {result?.fieldErrors?.name ? (
              <span className="text-xs text-red-600">{result.fieldErrors.name}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-body-sm font-semibold text-ink">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="805-000-0000"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary text-ink"
            />
            {result?.fieldErrors?.phone ? (
              <span className="text-xs text-red-600">{result.fieldErrors.phone}</span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-body-sm font-semibold text-ink">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary text-ink"
            />
            {result?.fieldErrors?.email ? (
              <span className="text-xs text-red-600">{result.fieldErrors.email}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="text-body-sm font-semibold text-ink">
              Event Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary text-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="guests" className="text-body-sm font-semibold text-ink">
              Estimated Guest Count *
            </label>
            <select
              id="guests"
              name="guests"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary text-ink"
            >
              <option value="">Select count...</option>
              <option value="10-25">10 – 25 Guests</option>
              <option value="25-50">25 – 50 Guests</option>
              <option value="50-100">50 – 100 Guests</option>
              <option value="100+">100+ Guests</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="text-body-sm font-semibold text-ink">
              Event Type *
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary text-ink"
            >
              <option value="">Select type...</option>
              <option value="Golf Tournament">Golf Tournament</option>
              <option value="Corporate Outing">Corporate Outing</option>
              <option value="Wedding / Reception">Wedding / Reception</option>
              <option value="Private Birthday Party">Private Party</option>
              <option value="Other Celebration">Other</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-body-sm font-semibold text-ink">
            Tell us about your event / Dietary needs
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Special requests, favorite smoked meats, preferred timing..."
            className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary text-ink"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full font-body font-semibold whitespace-nowrap transition-colors active:translate-y-px bg-brand-primary text-white hover:bg-brand-primary/90 active:bg-brand-primary/80 px-6 py-3.5 text-body-lg cursor-pointer mt-2 disabled:opacity-50"
        >
          {isPending ? 'Sending Request...' : 'Submit Catering Request'}
        </button>
      </form>
    </div>
  );
}
