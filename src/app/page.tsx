import type { Metadata } from "next";
import Link from "next/link";
import { home } from "@/content/pages";
import { site } from "@/content/site";
import { AreaIndex } from "@/components/AreaIndex";
import { Plate } from "@/components/Plate";
import { SectionOpener } from "@/components/SectionOpener";
import { cell } from "@/components/cells";
import { ui } from "@/content/ui";
import { whatsappLink } from "@/lib/whatsapp";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  description: site.seo.description,
  path: "/",
});

/**
 * Home — five bands: the nameplate, the opening statement in two columns,
 * the nine areas, one pull-quote, and how the firm works.
 */
export default function HomePage() {
  const [first, ...rest] = home.statement;

  return (
    <>
      <section className="nameplate" aria-labelledby="nameplate-title">
        <div className="wrap">
          <div className="nameplate-inner">
            <h1 id="nameplate-title" className="nameplate-mark">
              {site.brand.name}
            </h1>
            <p className="nameplate-line">{site.brand.line}</p>
          </div>
        </div>
      </section>

      <div className="band">
        <div className="wrap">
          <div className="prose cols statement" data-prose="statement">
            <p>
              <span className="initial">{home.statementLead}</span> {first}
            </p>
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <section className="band band-flush" aria-labelledby="areas-title">
        <div className="wrap">
          <h2 id="areas-title" className="linkset-heading index-label">
            {home.areasLabel}
          </h2>
          <AreaIndex variant="columns" headingLevel={3} />
          <p className="index-foot">
            <Link href={home.areasAll.href}>{home.areasAll.label}</Link>
          </p>
        </div>
      </section>

      <div className="pullquote band-tint">
        <div className="wrap">
          <p className="pullquote-text">{home.quote}</p>
        </div>
      </div>

      <section className="band" aria-labelledby="method-title">
        <div className="wrap">
          <SectionOpener
            numeral={home.method.numeral}
            title={home.method.heading}
            level={2}
            id="method-title"
          />
          <div className="method">
            <div className="cell" style={cell({ row: 1 }, { row: 1, col: 1 }, { row: 1 })}>
              <div className="prose measure" data-prose="method">
                {home.method.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>

              <div className="cta">
                <h3 className="cta-heading">{home.cta.heading}</h3>
                <p className="cta-body">{home.cta.body}</p>
                <ul className="cta-links">
                  <li>
                    <a href={`tel:${site.contact.phoneHref}`}>{home.cta.phoneLabel}</a>
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

            <div className="cell" style={cell({ row: 2 }, { row: 1, col: 2 }, { row: 2 })}>
              <Plate asset={home.method.image} />
            </div>
          </div>

          <nav className="linkset" aria-label={ui.pagesHeading}>
            <ul>
              {home.onward.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
