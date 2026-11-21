import { describe, expect, it } from "vitest";
import { tokenizeAcademySyntax } from "@/lib/academy/syntax-highlight";

describe("akademi kod sözdizimi", () => {
  it("Python anahtar sözcük, dizge ve yorumu ayırır", () => {
    const tokens = tokenizeAcademySyntax(
      'def toplam(adet):\n    # kuruş\n    return adet * 2\n',
      "py",
    );
    const kinds = tokens.filter((token) => token.kind !== "plain").map((token) => [token.kind, token.value]);
    expect(kinds).toContainEqual(["keyword", "def"]);
    expect(kinds).toContainEqual(["function", "toplam"]);
    expect(kinds).toContainEqual(["comment", "# kuruş"]);
    expect(kinds).toContainEqual(["keyword", "return"]);
    expect(kinds).toContainEqual(["number", "2"]);
  });

  it("TypeScript dizge ve anahtar sözcüğü boyar", () => {
    const tokens = tokenizeAcademySyntax('const ad = "Ayşe";\nfunction oku() {\n  return ad;\n}\n', "ts");
    const kinds = tokens.filter((token) => token.kind !== "plain").map((token) => [token.kind, token.value]);
    expect(kinds).toContainEqual(["keyword", "const"]);
    expect(kinds).toContainEqual(["string", '"Ayşe"']);
    expect(kinds).toContainEqual(["keyword", "function"]);
    expect(kinds).toContainEqual(["function", "oku"]);
    expect(kinds).toContainEqual(["keyword", "return"]);
  });
});
