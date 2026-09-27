import Link from "next/link";
import { groups, groupAnchor } from "@/content/practice";
import { site } from "@/content/site";
import { ui } from "@/content/ui";

/**
 * The nameplate at the top of every page: the wordmark and the three group
 * names, on the dark ground, with a hairline beneath. It sits at the top of the
 * document like a journal's masthead — not sticky, not floating, not
 * translucent, and there is no menu to open: three links fit at 390px.
 */
export function Masthead() {
  return (
    <header className="masthead ground-furniture">
      <div className="wrap">
        <div className="masthead-inner">
          <Link
            href="/"
            className="wordmark"
            aria-label={`${site.brand.name}، ${ui.nav.home}`}
          >
            <span className="wordmark-fa">{site.brand.name}</span>
            <span className="wordmark-latin" lang="en" dir="ltr">
              {site.brand.latin}
            </span>
          </Link>

          <nav aria-label={ui.nav.groups} className="masthead-nav">
            <ul>
              {groups.map((group) => (
                <li key={group.id}>
                  <Link href={`/practice/#${groupAnchor(group.id)}`}>{group.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
