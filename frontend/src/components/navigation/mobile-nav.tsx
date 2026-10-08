'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Logo } from '@/components/brand/logo';
import { SocialLinks } from '@/components/navigation/social-links';
import { IconButton } from '@/components/primitives/icon-button';
import { cn } from '@/lib/cn';
import {
  getMobileNavOpen,
  getMobileNavServerSnapshot,
  setMobileNavOpen,
  subscribeMobileNav,
} from '@/lib/mobile-nav-store';
import type { GlobalData } from '@/types/api';

/*
 * MobileNav — 06-COMPONENT-SPEC.md §MobileNav. The below-md hamburger trigger
 * (rendered inside the header) plus a portal-rendered drawer. The only client
 * concern is open/close state, focus management, and the body scroll lock; the
 * desktop nav is untouched and stays at md+.
 *
 * Open state lives in the shared mobile-nav store so MobileCtaBar can hide while
 * the drawer is open. useSyncExternalStore's server snapshot is `false`, so the
 * closed drawer renders identically on server and first client paint.
 *
 * Accessibility contract (06 §MobileNav): trigger aria-expanded/aria-controls;
 * panel role="dialog" aria-modal aria-label; focus moves to the close button on
 * open and back to the trigger on close (Escape and route change included);
 * Tab/Shift+Tab are trapped; background main + footer are aria-hidden; Escape
 * and backdrop click close; body scroll is locked with scrollbar compensation.
 * Motion is removed under prefers-reduced-motion via the .gotg-drawer/.gotg-scrim
 * rules.
 */

export interface MobileNavProps {
  global: GlobalData;
}

const PANEL_ID = 'mobile-nav-panel';
const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav({ global }: MobileNavProps): ReactNode {
  const open = useSyncExternalStore(
    subscribeMobileNav,
    getMobileNavOpen,
    getMobileNavServerSnapshot,
  );

  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { navigation, location, social, site } = global;

  // A route change always closes the drawer (06: "Route change → Closes").
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const body = document.body;
    const main = document.getElementById('main-content');
    const footer = document.querySelector('footer');

    // Body scroll lock with scrollbar-width compensation (no layout shift).
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) {
      body.style.paddingRight = `${String(scrollbar)}px`;
    }

    // Inert background for assistive tech.
    main?.setAttribute('aria-hidden', 'true');
    footer?.setAttribute('aria-hidden', 'true');

    // Move focus into the drawer (the close button is the first focusable).
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileNavOpen(false);
        return;
      }
      if (event.key !== 'Tab' || panel === null) {
        return;
      }
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) {
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      main?.removeAttribute('aria-hidden');
      footer?.removeAttribute('aria-hidden');
      // Focus always returns to the trigger on close.
      triggerWrapRef.current?.querySelector('button')?.focus();
    };
  }, [open]);

  const panelStyle: CSSProperties = { zIndex: 'var(--z-modal)' };
  const scrimStyle: CSSProperties = {
    zIndex: 'var(--z-overlay)',
    backgroundColor: 'var(--color-overlay-scrim)',
  };

  return (
    <>
      <div ref={triggerWrapRef} className="md:hidden">
        <IconButton
          icon="menu"
          label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => {
            setMobileNavOpen(true);
          }}
        />
      </div>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div className="md:hidden">
              <button
                type="button"
                aria-label="Close menu"
                tabIndex={-1}
                className="gotg-scrim fixed inset-0 opacity-100"
                style={scrimStyle}
                onClick={() => {
                  setMobileNavOpen(false);
                }}
              />
              <div
                ref={panelRef}
                id={PANEL_ID}
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                className="gotg-drawer bg-surface-raised fixed inset-y-0 right-0 flex w-full max-w-sm translate-x-0 flex-col gap-8 overflow-y-auto px-6 py-4 shadow-lg"
                style={panelStyle}
              >
                {/* Full brand logo to match header (per client request) */}
                <div className="flex items-center justify-between">
                  <Logo variant="primary" height="header" />
                  <IconButton
                    icon="close"
                    label="Close menu"
                    onClick={() => {
                      setMobileNavOpen(false);
                    }}
                  />
                </div>

                <nav aria-label="Site" className="flex flex-col gap-1.5">
                  {navigation.primary.map((item) => {
                    const active = pathname === item.href;
                    return item.isExternal ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between font-display text-body-lg text-ink py-2.5 px-3 rounded-xl font-semibold uppercase transition-all hover:bg-surface-sunken hover:text-brand-primary active:scale-[0.98]"
                      >
                        <span>{item.label}</span>
                        <span className="text-caption text-ink-muted">↗</span>
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between font-display text-body-lg py-2.5 px-3 rounded-xl uppercase transition-all active:scale-[0.98]',
                          active
                            ? 'bg-brand-primary-subtle font-bold text-brand-primary'
                            : 'font-semibold text-ink hover:bg-surface-sunken hover:text-brand-primary',
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span>{item.label}</span>
                        {active ? (
                          <span className="h-2 w-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(211,84,0,0.6)]" />
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>

                <a
                  href={location.phoneHref}
                  className="font-body text-body-lg text-brand font-semibold"
                >
                  Call {location.phone}
                </a>

                <SocialLinks links={social} siteName={site.name} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
