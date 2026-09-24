/**
 * The "continue" arrow.
 *
 * Drawn pointing along the reading direction and flipped by --flow-start, so
 * it points left in Persian and would point right in English. An arrow that
 * points the wrong way in RTL is one of the clearest tells that a layout was
 * built LTR-first and translated afterwards.
 */
export function ArrowLead({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="arrow-lead"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M14 8H2M2 8l5-5M2 8l5 5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}
