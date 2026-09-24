import Link from "next/link";
import type { ReactNode } from "react";
import { inquiry } from "@/content/sections";
import { cn } from "@/lib/cn";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  onClick?: () => void;
  /** Leaves the site: opens in a new tab and says so to a screen reader. */
  external?: boolean;
  className?: string;
}

/**
 * Renders an anchor when it navigates and a button when it acts. Getting this
 * wrong is the most common accessibility defect on a marketing site, so the
 * decision is made here once rather than at every call site.
 *
 * External destinations get a plain `<a>`: `next/link` has nothing to prefetch
 * or prefix off-site, and a new tab needs `rel="noopener noreferrer"` plus a
 * spoken warning — a link that silently reopens the browser somewhere else is
 * disorienting when you cannot see it happen.
 */
export function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  onClick,
  external = false,
  className,
}: ButtonProps) {
  const classes = cn("btn", `btn--${variant}`, className);

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        <span className="sr-only"> — {inquiry.newWindow}</span>
      </a>
    );
  }

  if (href) {
    // onClick is applied here as well as on the <button> below. It was declared
    // and silently dropped for links, which is how the mobile menu's own CTA
    // navigated without ever running the onClose it was given.
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
