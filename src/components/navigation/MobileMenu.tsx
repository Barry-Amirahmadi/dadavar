"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen navigation for small viewports.
 *
 * Slides in from the start edge of the reading direction — the right, in
 * Persian — so the panel arrives from the side the thumb and the eye are
 * already on. Focus is moved in on open, trapped while open, and returned to
 * the trigger on close.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      restoreTo.current?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      className="menu-panel on-dark"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label={ui.nav.menuDialog}
    >
      <div className="container flex items-center justify-between py-5">
        {/* Every control that leaves the panel closes it. The four nav links
            below already did; the lockup and the CTA did not, so tapping
            either navigated with the panel still covering the page and the
            body still locked from scrolling. */}
        <Wordmark onClick={onClose} />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="menu-toggle"
          aria-label={ui.nav.closeMenu}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>
      </div>

      {/* Same accessible name as the header's nav, and correctly so: the panel
          carries `visibility: hidden` while closed, so only ever one of the two
          is in the accessibility tree. */}
      <nav className="container flex-1 overflow-y-auto pt-8" aria-label={ui.nav.primary}>
        <ul>
          {site.nav.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="menu-panel__link"
                style={{ "--i": i } as CSSProperties}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container flex flex-col gap-6 pb-10 pt-8">
        <Button href={site.headerCta.href} variant="primary" className="w-full" onClick={onClose}>
          {site.headerCta.label}
        </Button>
        <ul className="flex flex-wrap gap-x-6">
          {site.social.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="t-meta footer-link"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
