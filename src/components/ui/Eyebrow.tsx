import { cn } from "@/lib/cn";

/**
 * A section label. The rule preceding it starts at the right edge of the text
 * block, which in RTL is where the eye begins — it points into the heading
 * rather than away from it.
 */
export function Eyebrow({ children, className }: { children: string; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}
