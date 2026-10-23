import { describe, expect, it } from "vitest";
import { bookCardHTML, bookDetailHTML } from "../public/app.js";

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

const cases = [
  { stock: 0, message: null },
  { stock: 1, message: "Only 1 copy left" },
  { stock: 2, message: "Only 2 copies left" },
  { stock: 3, message: "Only 3 copies left" },
  { stock: 4, message: null },
];

for (const [view, render] of [
  ["catalogue card", bookCardHTML],
  ["book detail", bookDetailHTML],
] as const) {
  describe(`${view} low-stock cue`, () => {
    it.each(cases)("renders the correct cue at stock $stock", ({ stock, message }) => {
      const html = render({ ...sample, stock });
      if (message === null) {
        expect(html).not.toContain("Only ");
        expect(html).not.toContain('class="low-stock"');
      } else {
        expect(html).toContain(message);
        expect(html).toContain('class="low-stock"');
      }
      expect(html).toContain("Quiet Orbit");
      expect(html).toContain("Samuel Reyes");
      expect(html).toContain("$15.99");
    });

    it("keeps dangerous title and author text escaped beside the cue", () => {
      const html = render({
        ...sample,
        stock: 1,
        title: "<script>bad()</script>",
        author: '<img src=x onerror="bad()">',
      });
      expect(html).toContain("Only 1 copy left");
      expect(html).toContain("&lt;script&gt;");
      expect(html).toContain("&lt;img");
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("<img");
    });
  });
}
