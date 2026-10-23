import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { store } from "../src/store.js";

type Listener = (event: { target: TestNode; preventDefault: () => void }) => void;
class TestNode {
  innerHTML = "";
  textContent = "";
  hidden = false;
  disabled = false;
  value = "1";
  dataset: Record<string, string> = {};
  selectors: string[] = [];
  listeners: Record<string, Listener[]> = {};
  classList = { toggle: () => {} };
  attributes: Record<string, string> = {};
  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }
  addEventListener(name: string, fn: Listener) {
    (this.listeners[name] ??= []).push(fn);
  }
  closest(selector: string) {
    return this.selectors.includes(selector) ? this : null;
  }
  querySelector(selector: string) {
    return selector === ".cart-quantity" ? quantity : null;
  }
  querySelectorAll() {
    return [];
  }
  click(target: TestNode) {
    for (const fn of this.listeners.click ?? []) fn({ target, preventDefault() {} });
  }
}
const ids = [
  "book-grid",
  "detail-view",
  "catalogue-view",
  "about-view",
  "hero",
  "cart-view",
  "cart-content",
  "cart-status",
  "new-cart-btn",
];
let nodes: Record<string, TestNode>;
let nav: TestNode;
let quantity: TestNode;
let calls: { path: string; method: string }[];
let failNext: "network" | "api" | "missing" | undefined;
let failCatalogue = false;
const app = createApp();

async function settle() {
  for (let i = 0; i < 10; i++) await new Promise((resolve) => setTimeout(resolve, 5));
}
function button(selector: string, id = "the-lantern-sea") {
  const node = new TestNode();
  node.selectors = [selector, ".cart-line"];
  node.dataset.id = id;
  return node;
}
function navigate(view: string) {
  const link = button("a[data-view]");
  link.dataset.view = view;
  nav.click(link);
}
function add() {
  nodes["book-grid"]!.click(button(".add-btn"));
}
function content() {
  return nodes["cart-content"]!.innerHTML;
}
function status() {
  return nodes["cart-status"]!.textContent;
}

beforeEach(async () => {
  vi.resetModules();
  store.reset();
  calls = [];
  failNext = undefined;
  failCatalogue = false;
  nodes = Object.fromEntries(ids.map((id) => [id, new TestNode()]));
  nodes["new-cart-btn"]!.hidden = true;
  quantity = new TestNode();
  nav = new TestNode();
  vi.stubGlobal("document", {
    getElementById: (id: string) => nodes[id] ?? null,
    querySelector: (selector: string) => (selector === ".nav" ? nav : null),
    querySelectorAll: () => [],
  });
  vi.stubGlobal("fetch", async (path: string, options: RequestInit = {}) => {
    const method = options.method ?? "GET";
    calls.push({ path, method });
    if (path === "/api/books" && failCatalogue) throw new Error("Catalogue offline");
    if (path.includes("/items") && method !== "GET" && failNext) {
      const failure = failNext;
      failNext = undefined;
      if (failure === "network") throw new Error("Network offline");
      return {
        ok: false,
        status: failure === "missing" ? 404 : 400,
        json: async () => ({
          error: failure === "missing" ? "Cart not found" : "Not enough stock",
        }),
      };
    }
    const agent = request(app);
    const operation =
      method === "POST"
        ? agent.post(path)
        : method === "PATCH"
          ? agent.patch(path)
          : method === "DELETE"
            ? agent.delete(path)
            : agent.get(path);
    const response = options.body
      ? await operation.send(JSON.parse(String(options.body)))
      : await operation;
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.body,
    };
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});
async function boot() {
  await import("../public/app.js");
  await settle();
}

describe("storefront cart interactions", () => {
  it("creates only one cart for rapid additions and shows the merged confirmed total", async () => {
    await boot();
    add();
    add();
    await settle();
    navigate("cart");
    await settle();
    expect(calls.filter((c) => c.path === "/api/carts" && c.method === "POST")).toHaveLength(1);
    expect(content()).toContain('value="2"');
    expect(content()).toContain("$29.98");
    expect(nodes["cart-view"]!.hidden).toBe(false);
  });
  it("updates then removes a line through the real API and displays the empty state", async () => {
    await boot();
    add();
    await settle();
    navigate("cart");
    await settle();
    quantity.value = "3";
    nodes["cart-view"]!.click(button(".update-btn"));
    await settle();
    expect(content()).toContain('value="3"');
    expect(content()).toContain("$44.97");
    nodes["cart-view"]!.click(button(".remove-btn"));
    await settle();
    expect(content()).toContain("Your cart is empty");
    expect(calls.some((c) => c.method === "PATCH")).toBe(true);
    expect(calls.some((c) => c.method === "DELETE")).toBe(true);
  });
  it.each(["network", "api"] as const)(
    "shows %s failure and retains the last confirmed cart",
    async (failure) => {
      await boot();
      add();
      await settle();
      navigate("cart");
      await settle();
      const before = content();
      failNext = failure;
      add();
      await settle();
      expect(status()).toContain(failure === "network" ? "Network offline" : "Not enough stock");
      expect(content()).toBe(before);
      expect(nodes["new-cart-btn"]!.hidden).toBe(true);
      add();
      await settle();
      expect(content()).toContain('value="2"');
    },
  );
  it("offers explicit recovery for a missing cart rather than silently replacing it", async () => {
    await boot();
    add();
    await settle();
    navigate("cart");
    await settle();
    const before = content();
    failNext = "missing";
    add();
    await settle();
    expect(status()).toContain("Cart not found");
    expect(content()).toBe(before);
    expect(nodes["new-cart-btn"]!.hidden).toBe(false);
    nodes["new-cart-btn"]!.click(button("#new-cart-btn"));
    await settle();
    expect(content()).toContain("Your cart is empty");
    expect(nodes["new-cart-btn"]!.hidden).toBe(true);
    expect(calls.filter((c) => c.path === "/api/carts" && c.method === "POST")).toHaveLength(2);
  });
  it("keeps Home, About, detail and Back navigation working", async () => {
    await boot();
    navigate("about");
    expect(nodes["about-view"]!.hidden).toBe(false);
    navigate("home");
    expect(nodes["catalogue-view"]!.hidden).toBe(false);
    nodes["book-grid"]!.click(button(".view-btn"));
    await settle();
    expect(nodes["detail-view"]!.hidden).toBe(false);
    const back = button("#back-btn");
    back.dataset.id = "back-btn";
    Object.assign(back, { id: "back-btn" });
    nodes["detail-view"]!.click(back);
    expect(nodes["catalogue-view"]!.hidden).toBe(false);
  });
  it("reports catalogue network errors visibly instead of leaving a rejected bootstrap promise", async () => {
    failCatalogue = true;
    await boot();
    expect(status()).toContain("Catalogue offline");
  });
});
