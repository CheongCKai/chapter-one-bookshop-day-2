import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  formatPrice,
  bookCardHTML,
  cartItemHTML,
  orderConfirmationHTML,
} from "../public/app.js";

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
});

describe("cartItemHTML", () => {
  const item = { bookId: "the-lantern-sea", quantity: 2, unitPrice: 14.99 };

  it("renders the title, unit price, quantity and line total", () => {
    const html = cartItemHTML(item, "The Light Between Oceans");
    expect(html).toContain("The Light Between Oceans");
    expect(html).toContain("$14.99");
    expect(html).toContain("2");
    expect(html).toContain("$29.98");
  });

  it("escapes a dangerous title", () => {
    const html = cartItemHTML(item, "<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("orderConfirmationHTML", () => {
  const order = {
    id: "abc-123",
    items: [{ bookId: "the-lantern-sea", quantity: 2, unitPrice: 14.99 }],
    total: 29.98,
  };

  it("renders the order id and grand total", () => {
    const html = orderConfirmationHTML(order);
    expect(html).toContain("abc-123");
    expect(html).toContain("$29.98");
  });

  it("renders the line item quantity", () => {
    const html = orderConfirmationHTML(order);
    expect(html).toContain("2");
  });
});
