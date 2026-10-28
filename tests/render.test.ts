import { describe, it, expect } from "vitest";
import { escapeHtml, formatPrice, bookCardHTML, bookDetailHTML } from "../public/app.js";

const sample = {
  id: "quiet-orbit",
  title: "Quiet Orbit",
  author: "Samuel Reyes",
  price: 15.99,
  genre: "Sci-Fi",
  stock: 8,
  description: "A maintenance crew learns the silence is listening back.",
  cover: "2A2456",
  coverImage: "covers/quiet-orbit.jpg",
};

describe("formatPrice", () => {
  it("formats to two decimals with a dollar sign", () => {
    expect(formatPrice(15.9)).toBe("$15.90");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml('<script>"x"')).toBe("&lt;script&gt;&quot;x&quot;");
  });
});

describe("bookCardHTML", () => {
  it("includes the title, author and formatted price", () => {
    const html = bookCardHTML(sample);
    expect(html).toContain("Quiet Orbit");
    expect(html).toContain("Samuel Reyes");
    expect(html).toContain("$15.99");
  });

  it("escapes a dangerous title instead of emitting raw markup", () => {
    const html = bookCardHTML({ ...sample, title: "<img src=x onerror=alert(1)>" });
    // The angle brackets must be escaped, so no real <img ...> tag appears.
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("shows low-stock cues only for stock values 1 through 3", () => {
    const stockCases = [
      { stock: 0, message: null },
      { stock: 1, message: "Only 1 copy left" },
      { stock: 2, message: "Only 2 copies left" },
      { stock: 3, message: "Only 3 copies left" },
      { stock: 4, message: null },
    ];

    for (const { stock, message } of stockCases) {
      const html = bookCardHTML({ ...sample, stock });
      if (message) {
        expect(html).toContain(`<p class="low-stock">${message}</p>`);
      } else {
        expect(html).not.toContain("low-stock");
        expect(html).not.toContain("copy left");
        expect(html).not.toContain("copies left");
      }
    }
  });
});

describe("bookDetailHTML", () => {
  it("shows low-stock cues only for stock values 1 through 3", () => {
    const stockCases = [
      { stock: 0, message: null },
      { stock: 1, message: "Only 1 copy left" },
      { stock: 2, message: "Only 2 copies left" },
      { stock: 3, message: "Only 3 copies left" },
      { stock: 4, message: null },
    ];

    for (const { stock, message } of stockCases) {
      const html = bookDetailHTML({ ...sample, stock });
      if (message) {
        expect(html).toContain(`<p class="low-stock">${message}</p>`);
      } else {
        expect(html).not.toContain("low-stock");
        expect(html).not.toContain("copy left");
        expect(html).not.toContain("copies left");
      }
    }
  });
});
