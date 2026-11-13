import { describe, expect, it } from "vitest";
import { resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("keeps a stored choice over the system preference", () => {
    expect(resolveTheme("dark", true)).toBe("dark");
    expect(resolveTheme("light", false)).toBe("light");
  });

  it("falls back to the system preference when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("light");
    expect(resolveTheme(undefined, false)).toBe("dark");
  });

  it("ignores a value it does not understand", () => {
    expect(resolveTheme("", true)).toBe("light");
    expect(resolveTheme("sepia", false)).toBe("dark");
    expect(resolveTheme("LIGHT", true)).toBe("light");
  });
});
