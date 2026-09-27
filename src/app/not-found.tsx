import type { Metadata } from "next";
import Link from "next/link";
import { notFound as copy } from "@/content/pages";
import { SectionOpener } from "@/components/SectionOpener";
import { toFa } from "@/lib/digits";

export const metadata: Metadata = {
  title: copy.heading,
};

export default function NotFound() {
  return (
    <div className="wrap band">
      <SectionOpener numeral={toFa(404)} title={copy.heading} level={1} />
      <p className="standfirst notfound-lead">{copy.lead}</p>
      <nav className="linkset" aria-label={copy.heading}>
        <ul>
          {copy.actions.map((action) => (
            <li key={action.href}>
              <Link href={action.href}>{action.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
