import Link from "next/link";
import { groups, groupAnchor } from "@/content/practice";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { faNumber } from "@/lib/digits";
import { whatsappLink } from "@/lib/whatsapp";
import { home } from "@/content/pages";
import { cell } from "./cells";

/**
 * The footer, on the dark ground: the pages, the three groups again, the
 * contact placeholder, and a Persian copyright year.
 *
 * The year goes through `faNumber`, never `toLocaleString("fa-IR")`, which
 * would print ۲٬۰۲۶ with a thousands separator inside it. The disclaimer is the
 * one quiet sentence that says what the site is.
 */
export function Colophon() {
  const year = faNumber(new Date().getFullYear());

  return (
    <footer className="colophon ground-furniture">
      <div className="wrap">
        <div className="colophon-grid">
          <div className="cell" style={cell({ row: 1 }, { row: 1, col: 1 })}>
            <p className="wordmark-fa">{site.brand.name}</p>
            <p className="colophon-line">{site.brand.line}</p>
          </div>

          <nav
            aria-label={ui.nav.colophon}
            className="cell"
            style={cell({ row: 2 }, { row: 1, col: 2 })}
          >
            <h2 className="colophon-heading">{ui.pagesHeading}</h2>
            <ul>
              {site.pages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href}>{page.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label={ui.nav.groups}
            className="cell"
            style={cell({ row: 3 }, { row: 1, col: 3 })}
          >
            <h2 className="colophon-heading">{ui.groupsHeading}</h2>
            <ul>
              {groups.map((group) => (
                <li key={group.id}>
                  <Link href={`/practice/#${groupAnchor(group.id)}`}>{group.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="cell" style={cell({ row: 4 }, { row: 1, col: 4 })}>
            <h2 className="colophon-heading">{ui.contactHeading}</h2>
            <ul>
              <li>{site.contact.city}</li>
              <li>
                <a href={`tel:${site.contact.phoneHref}`}>
                  <span dir="ltr">{site.contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(site.contact.whatsapp, home.cta.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {home.cta.whatsappLabel}
                  <span className="sr-only">، {ui.newWindow}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="colophon-foot">
          <p>
            © {year} {site.copyrightName}
          </p>
          <p>{site.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
