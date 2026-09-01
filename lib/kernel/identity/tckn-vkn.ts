/**
 * TCKN (11) ve VKN (10) basamak + sağlama. Sahte künye e-Arşiv'e yazılmaz.
 */

export function digitsOnly(value: string | null | undefined): string {
  if (value == null) {
    return "";
  }
  return value.replace(/\D/g, "");
}

export function isValidTckn(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) {
    return false;
  }
  const digits = value.split("").map((char) => Number(char));
  const odd = digits[0]! + digits[2]! + digits[4]! + digits[6]! + digits[8]!;
  const even = digits[1]! + digits[3]! + digits[5]! + digits[7]!;
  const tenth = (((odd * 7 - even) % 10) + 10) % 10;
  if (tenth !== digits[9]) {
    return false;
  }
  const eleventh = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;
  return eleventh === digits[10];
}

export function isValidVkn(value: string): boolean {
  if (!/^[0-9]{10}$/.test(value)) {
    return false;
  }
  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    const digit = Number(value[index]);
    const tmp = (digit + (9 - index)) % 10;
    let step = (tmp * 2 ** (9 - index)) % 9;
    if (tmp !== 0 && step === 0) {
      step = 9;
    }
    sum += step;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(value[9]);
}
