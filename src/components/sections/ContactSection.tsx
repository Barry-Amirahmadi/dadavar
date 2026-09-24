import { site } from "@/content/site";
import { contact, inquiry } from "@/content/sections";
import { whatsappLink } from "@/lib/whatsapp";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

/**
 * The inquiry architecture of §42, in full and in one place.
 *
 * WhatsApp first because it is the channel that actually converts here, then
 * Instagram for a visitor who is still at the brand-discovery stage, then the
 * direct details for anyone who would rather not use either. No form: one needs
 * a third-party backend to post to, and a custom API route cannot run on a
 * static host — so the mechanism offered is the one that genuinely works.
 *
 * On the dark ground, because this is where the page ends and the closing
 * moment on every other page is dark too.
 *
 * `id="contact"` lives here rather than on the footer now. The footer carried
 * it as a Phase 01 stopgap while there was nowhere else for «تماس با ما» to go;
 * two elements answering to the same anchor on the same page would be an
 * ordinary duplicate-id defect.
 */
export function ContactSection() {
  const chatHref = whatsappLink(site.contact.whatsapp, inquiry.generalMessage);

  const details = [
    { label: contact.labels.city, value: site.contact.city, href: undefined },
    { label: contact.labels.phone, value: site.contact.phone, href: `tel:${site.contact.phoneHref}` },
    { label: contact.labels.email, value: site.contact.email, href: `mailto:${site.contact.email}` },
  ];

  return (
    <section id="contact" aria-labelledby="contact-heading" className="ground-dark on-dark">
      <div className="container py-[var(--section-y)]">
        <SectionHeading
          id="contact-heading"
          eyebrow={contact.eyebrow}
          heading={contact.heading}
          lead={contact.lead}
          className="mb-[var(--section-y-tight)]"
        />

        <div className="grid-editorial items-start">
          <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-6">
            <Reveal>
              <div className="flex flex-wrap gap-3">
                <Button href={chatHref} external>
                  {inquiry.generalLabel}
                </Button>
                <Button href={site.contact.instagram.href} variant="secondary" external>
                  {contact.instagramLabel}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={80}>
              {/* The paragraph stays RTL so it sits under the buttons it belongs
                  to; only the handle itself is isolated as LTR. Putting dir on
                  the paragraph aligns the whole line to the left instead, which
                  strands it at the far edge of the column. */}
              <p className="t-meta">
                <span dir="ltr">{site.contact.instagram.handle}</span>
              </p>
            </Reveal>
          </div>

          <dl className="col-span-4 md:col-span-8 lg:col-start-8 lg:col-span-5">
            {details.map((detail, index) => (
              <Reveal
                as="div"
                key={detail.label}
                delay={index * 70}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--color-line-dark)] py-4 first:border-t"
              >
                <dt className="t-meta">{detail.label}</dt>
                <dd className="t-body">
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="crumb"
                      // The email is Latin inside an RTL document; without this
                      // the address reads back to front.
                      dir={detail.href.startsWith("mailto:") ? "ltr" : undefined}
                    >
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
