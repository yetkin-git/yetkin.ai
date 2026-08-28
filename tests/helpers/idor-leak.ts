import { expect } from "vitest";

export function wireJson(value: unknown): string {
  return JSON.stringify(value);
}

export function assertWireOmits(value: unknown, secrets: readonly string[]): void {
  const wire = wireJson(value);
  for (const secret of secrets) {
    expect(wire, `IDOR sızıntısı: ${secret}`).not.toContain(secret);
  }
}

export function assertWireContains(value: unknown, tokens: readonly string[]): void {
  const wire = wireJson(value);
  for (const token of tokens) {
    expect(wire, `eksik alan: ${token}`).toContain(token);
  }
}
