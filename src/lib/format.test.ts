import { describe, it, expect } from "vitest";
import { formatDate, emailInitials, escapeHtml } from "./format";

describe("formatDate", () => {
  it("formats ISO string with Russian locale", () => {
    const result = formatDate("2026-01-15T10:00:00Z", "ru");
    expect(result).toContain("2026");
    expect(result).toContain("15");
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2026-06-01"), "en");
    expect(result).toContain("2026");
  });

  it("returns original string for invalid date", () => {
    expect(formatDate("not-a-date", "ru")).toBe("not-a-date");
  });

  it("uses Kazakh locale for kk", () => {
    const result = formatDate("2026-03-20", "kk");
    expect(result).toContain("2026");
  });

  it("falls back to ru-RU for unknown language", () => {
    const result = formatDate("2026-01-01", "xx");
    expect(result).toContain("2026");
  });
});

describe("emailInitials", () => {
  it("extracts initials from dot-separated email", () => {
    expect(emailInitials("john.doe@example.com")).toBe("JD");
  });

  it("extracts initials from underscore-separated email", () => {
    expect(emailInitials("anna_smith@bi.group")).toBe("AS");
  });

  it("extracts initials from hyphen-separated email", () => {
    expect(emailInitials("ivan-petrov@mail.ru")).toBe("IP");
  });

  it("falls back to first two chars for single-part local", () => {
    expect(emailInitials("admin@bi.group")).toBe("AD");
  });

  it("handles empty string", () => {
    expect(emailInitials("")).toBe("");
  });
});

describe("escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert('xss')&lt;/script&gt;",
    );
  });

  it("escapes ampersand and quotes", () => {
    expect(escapeHtml('a & "b"')).toBe("a &amp; &quot;b&quot;");
  });

  it("leaves safe strings unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});
