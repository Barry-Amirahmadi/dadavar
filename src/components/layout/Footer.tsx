import Link from "next/link";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Footer — a colophon, and a convenience copy of the contact details.
 *
 * It carried `id="contact"` through Phase 01 because there was nowhere else for
 * «تماس با ما» to land. The about page now owns that anchor; the footer renders
 * on that page too, so keeping the id here would put two elements on one page
 * answering to the same name.
 *
 * The oversized wordmark at the bottom is the one purely graphic element on the
 * page: it closes the document the way a colophon closes a book.
 *
 * **There is deliberately no newsletter signup here, and re-adding one needs a
 * backend first.** Phase 01 shipped the field with `action="#"` and no method,
 * which the final pass measured: submitting reloaded the page, lost the scroll
 * position, put the visitor's typed email address into the URL — and so into
 * browser history and any outgoing referrer — and showed no confirmation at
 * all. §42 allows a form only when it posts to a third-party static-compatible
 * backend, and there is none to post to for a brand that does not exist, so the
 * block was removed rather than faked. The row is three columns across twelve
 * now, anchored at both edges; that spacing is what the removal left, not a
 * separate design change.
 */
export function Footer() {
  return (
    <footer className="ground-dark on-dark">
      <div className="container py-[var(--section-y-tight)]">
        <div className="grid-editorial">
          {/* Brand line */}
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Reveal>
              <p className="t-h3">{site.brand.name}</p>
              <p className="t-body mt-3 max-w-[26ch]">{site.brand.line}</p>
            </Reveal>
          </div>

          {/* Navigation */}
          <nav
            className="col-span-2 md:col-span-4 lg:col-start-7 lg:col-span-2"
            aria-label={ui.nav.footer}
          >
            <Reveal delay={60}>
              <h2 className="t-label mb-5">{site.footer.navHeading}</h2>
              <ul className="flex flex-col">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="t-meta footer-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </nav>

          {/* Contact */}
          <div className="col-span-2 md:col-span-4 lg:col-start-10 lg:col-span-3">
            <Reveal delay={120}>
              <h2 className="t-label mb-5">{site.footer.contactHeading}</h2>
              <ul className="flex flex-col">
                <li className="t-meta flex min-h-11 items-center">{site.contact.city}</li>
                <li>
                  <a
                    href={`tel:${site.contact.phoneHref}`}
                    className="t-meta footer-link"
                  >
                    {site.contact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="t-meta footer-link"
                    dir="ltr"
                  >
                    {site.contact.email}
                  </a>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>

        {/* Social + legal */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--color-line-dark)] pt-6">
          <ul className="flex flex-wrap items-center gap-x-6">
            {site.social.map((item) => (
              <li key={item.label}>
                {/* These leave the site now that they point at real profile
                    URLs rather than at "#". */}
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
          {/* Rendered only when there is something to render — an empty list
              would otherwise leave a bare flex child holding the row open. */}
          {site.legal.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-6">
              {site.legal.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="t-meta footer-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Colophon */}
        <div className="mt-14 flex flex-wrap items-end justify-between gap-6">
          <p
            className="t-display leading-none text-[var(--color-chalk)] opacity-15"
            aria-hidden="true"
          >
            {site.brand.name}
          </p>
          <p className="t-meta">{site.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
