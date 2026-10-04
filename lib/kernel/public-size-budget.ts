/**
 * `public/` statik boyut bütçesi.
 * Bayt eşiği 1024² ile çarpılır. Paket 2 ölçümü bu birimle 866,1 MB idi.
 * 850 MB üstü sarı uyarıdır. 950 MB üstü derlemeyi durdurur.
 * Eşit değer eşiği aşmış sayılmaz.
 */

const MIB = 1024 * 1024;

export const PUBLIC_SIZE_WARN_BYTES = 850 * MIB;
export const PUBLIC_SIZE_FAIL_BYTES = 950 * MIB;

export type PublicSizeVerdict = "ok" | "warn" | "fail";

export function classifyPublicDirectoryBytes(bytes: number): PublicSizeVerdict {
  if (bytes > PUBLIC_SIZE_FAIL_BYTES) {
    return "fail";
  }
  if (bytes > PUBLIC_SIZE_WARN_BYTES) {
    return "warn";
  }
  return "ok";
}
