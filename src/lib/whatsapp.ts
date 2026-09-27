/**
 * WhatsApp click-to-chat — the firm's second contact route beside the phone.
 * A plain `https://wa.me/...` link, which works on a static host with nothing
 * behind it. The number is an unassigned placeholder; wa.me answers it with
 * "this link is invalid" rather than opening a chat with a stranger.
 */
export function whatsappLink(number: string, message: string): string {
  // Digits only: wa.me rejects punctuation, and a leading "+" breaks the path.
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
