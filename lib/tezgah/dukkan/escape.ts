/**
 * Metin ve öznitelik kaçışı. Kullanıcı cümlesi etiket, adres veya olay açamaz.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/javascript\s*:/gi, "javascript&#58;")
    .replace(/on([a-z0-9]+)\s*=/gi, "on$1&#61;");
}
