/**
 * Cloudflare Email Obfuscation ham `user@host` görünce
 * `/cdn-cgi/scripts/.../email-decode.min.js` enjekte eder.
 * Nonce CSP bu script'i keser; kenar HTML'i React ağacından saptırır (#418).
 * Kaynakta `@` yok: parçalar ayrı düğüm, adres `&#64;` ile birleşir.
 */
export function ObfuscatedEmailText({ email }: { email: string }) {
  const at = email.indexOf("@");
  if (at < 1 || at === email.length - 1) {
    return <span suppressHydrationWarning>{email}</span>;
  }
  const user = email.slice(0, at);
  const host = email.slice(at + 1);
  return (
    <span suppressHydrationWarning>
      {user}
      <span dangerouslySetInnerHTML={{ __html: "&#64;" }} />
      {host}
    </span>
  );
}
