/**
 * One block of Schema.org structured data.
 *
 * `<` is escaped because a `</script>` sequence anywhere inside the JSON would
 * otherwise close this element early and drop the rest of the page into the
 * document as markup. Nothing in the current content contains one — every value
 * is Persian brand copy — but the escape costs nothing and the failure is
 * silent and total.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
