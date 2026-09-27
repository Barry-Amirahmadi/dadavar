/**
 * Fills `{token}` placeholders in an interface string. Tokens rather than
 * positional arguments, so a string stays editable as content — an editor
 * reordering a Persian sentence never has to think about argument order.
 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
