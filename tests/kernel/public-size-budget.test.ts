import { describe, expect, it } from "vitest";
import {
  classifyPublicDirectoryBytes,
  PUBLIC_SIZE_FAIL_BYTES,
  PUBLIC_SIZE_WARN_BYTES,
} from "@/lib/kernel/public-size-budget";

describe("public/ boyut bütçesi", () => {
  it("850 MB ve altı yeşil, üstü sarı, 950 MB üstü kırmızı", () => {
    expect(PUBLIC_SIZE_WARN_BYTES).toBe(850 * 1024 * 1024);
    expect(PUBLIC_SIZE_FAIL_BYTES).toBe(950 * 1024 * 1024);
    expect(classifyPublicDirectoryBytes(0)).toBe("ok");
    expect(classifyPublicDirectoryBytes(PUBLIC_SIZE_WARN_BYTES)).toBe("ok");
    expect(classifyPublicDirectoryBytes(PUBLIC_SIZE_WARN_BYTES + 1)).toBe("warn");
    expect(classifyPublicDirectoryBytes(PUBLIC_SIZE_FAIL_BYTES)).toBe("warn");
    expect(classifyPublicDirectoryBytes(PUBLIC_SIZE_FAIL_BYTES + 1)).toBe("fail");
  });
});
