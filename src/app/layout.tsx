import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic, Reem_Kufi } from "next/font/google";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { organizationSchema } from "@/content/schema";
import { siteRoot } from "@/lib/seo";
import { Masthead } from "@/components/Masthead";
import { Colophon } from "@/components/Colophon";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

/**
 * Two faces, both self-hosted by next/font at build time — no third-party font
 * request to be slow or blocked from inside Iran.
 *
 * Noto Naskh Arabic — body, standfirsts, marginal notes, headings.
 * Reem Kufi         — wordmark, section numerals, the pull-quote, the initial.
 *
 * **The body face is not the one the prompt named, and that is deliberate.**
 * The prompt asked for `Noto Serif Arabic`, which does not exist on Google
 * Fonts — there is no such family to load. `Noto Naskh Arabic` is the Noto
 * serif Arabic design under its real name. Reported, not silently substituted.
 *
 * Both faces were checked for پ چ ژ گ ک ی ه and ۰–۹ in the `arabic` subset's
 * cmap before any component was written; `scripts/verify.mjs` repeats the
 * check at runtime against the family that actually resolves.
 *
 * Both subsets on both faces: Google's `arabic` subset does not contain the
 * space or general punctuation, so the `latin` file downloads either way —
 * dropping it only loses its preload.
 */
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-naskh",
  display: "swap",
});

const kufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  variable: "--font-kufi",
  display: "swap",
});

/**
 * Site-wide defaults. Every route composes its own title, description,
 * canonical and social card through `pageMetadata`.
 *
 * `robots` is noindex/nofollow: this is a demonstration of a fictional firm.
 * On a GitHub Pages project site the generated robots.txt sits under a subpath
 * no crawler reads, so this meta tag is what actually does the work.
 */
export const metadata: Metadata = {
  metadataBase: new URL(`${siteRoot}/`),
  title: {
    default: site.seo.title,
    template: site.seo.titleTemplate,
  },
  description: site.seo.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#181f26",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${naskh.variable} ${kufi.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          {ui.skipToContent}
        </a>

        <Masthead />
        <main id="main">{children}</main>
        <Colophon />

        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
