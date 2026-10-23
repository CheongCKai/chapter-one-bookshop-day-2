import { describe, expect, it } from "vitest";
import * as storefront from "../public/app.js";

const book = {
  id: 'book"<&',
  title: "<script>bad()</script>",
  author: "Reader",
  price: 14.99,
  genre: "Fiction",
  stock: 2,
  description: "A book",
  cover: "123456",
  coverImage: "cover.jpg",
};

describe("cart rendering", () => {
  it("shows an empty cart and a way back to the catalogue", () => {
    expect(storefront.cartHTML).toBeTypeOf("function");
    const html = storefront.cartHTML({ cartId: "cart", items: [], total: 0 });
    expect(html).toContain("Your cart is empty");
    expect(html).toContain("Back to catalogue");
    expect(html).not.toMatch(/checkout/i);
  });

  it("escapes line data and shows quantities, controls and exact currency totals", () => {
    expect(storefront.cartHTML).toBeTypeOf("function");
    const html = storefront.cartHTML({
      cartId: "cart",
      items: [
        {
          bookId: book.id,
          title: book.title,
          unitPrice: 14.99,
          quantity: 2,
          lineTotal: 29.98,
        },
      ],
      total: 29.98,
    });
    expect(html).toContain("&lt;script&gt;bad()&lt;/script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain('data-id="book&quot;&lt;&amp;"');
    expect(html).toContain('value="2"');
    expect(html).toContain("$14.99");
    expect(html).toContain("$29.98");
    expect(html).toContain("Update");
    expect(html).toContain("Remove");
    expect(html).not.toMatch(/checkout/i);
  });

  it.each([storefront.bookCardHTML, storefront.bookDetailHTML])(
    "offers Add for available books and disables it at zero stock",
    (render) => {
      expect(render(book)).toContain("Add to cart");
      expect(render(book)).toMatch(/class="[^"]*add-btn[^"]*"[^>]*data-id="book&quot;&lt;&amp;"/);
      expect(render({ ...book, stock: 0 })).toMatch(/class="[^"]*add-btn[^"]*"[^>]*disabled/);
    },
  );
});
