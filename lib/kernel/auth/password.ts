/**
 * Vatandaş şifre sözleşmesi.
 * Kayıt formu en az 8 karakter ister (mevcut yüzey). Üretilen şifre CSPRNG ile
 * 16 karakter, dört sınıf (küçük/büyük/rakam/sembol) ve belirsiz gliflerden arınmış.
 */

export const CITIZEN_PASSWORD_MIN_LENGTH = 8;
export const GENERATED_PASSWORD_LENGTH = 16;

export const PASSWORD_RESET_PATH = "/sifremi-unuttum";
export const PASSWORD_RECOVERY_PATH = "/sifre-yenile";

const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+";
const ALL = `${LOWER}${UPPER}${DIGITS}${SYMBOLS}`;

function randomIndex(maxExclusive: number): number {
  if (maxExclusive <= 0 || maxExclusive > 256) {
    throw new Error("Şifre üretici aralığı geçersiz.");
  }
  const cap = Math.floor(256 / maxExclusive) * maxExclusive;
  const buf = new Uint8Array(1);
  let value = 256;
  do {
    crypto.getRandomValues(buf);
    value = buf[0] ?? 256;
  } while (value >= cap);
  return value % maxExclusive;
}

function pickChar(alphabet: string): string {
  const char = alphabet[randomIndex(alphabet.length)];
  if (!char) {
    throw new Error("Şifre üretici boş alfabe.");
  }
  return char;
}

function shuffle(chars: string[]): string[] {
  const next = [...chars];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    const left = next[i];
    const right = next[j];
    if (left === undefined || right === undefined) {
      throw new Error("Şifre üretici karıştırma hatası.");
    }
    next[i] = right;
    next[j] = left;
  }
  return next;
}

export function generateSecurePassword(length = GENERATED_PASSWORD_LENGTH): string {
  const size = Math.max(length, GENERATED_PASSWORD_LENGTH);
  const chars: string[] = [pickChar(LOWER), pickChar(UPPER), pickChar(DIGITS), pickChar(SYMBOLS)];
  while (chars.length < size) {
    chars.push(pickChar(ALL));
  }
  return shuffle(chars).join("");
}

export function isGeneratedPasswordShape(value: string): boolean {
  return (
    value.length >= GENERATED_PASSWORD_LENGTH &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}
