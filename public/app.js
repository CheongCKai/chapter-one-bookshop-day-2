// Chapter One storefront — plain ES module, no framework, no build step.
// The pure helpers below are exported so tests can check them directly.

/** Escape text before putting it into HTML, so a title like `<b>x</b>` is shown, not run. */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Format a numeric price as a dollar string, e.g. 14.9 -> "$14.90". */
export function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

/** One book card for the catalogue grid. Returns an HTML string. */
export function bookCardHTML(book) {
  const title = escapeHtml(book.title);
  const author = escapeHtml(book.author);
  const cover = escapeHtml(book.coverImage);
  return `
    <article class="card" data-id="${escapeHtml(book.id)}">
      <div
        class="cover"
        role="img"
        aria-label="Cover of ${title}"
        style="background-color:#${escapeHtml(book.cover)};background-image:url('${cover}')"
      ></div>
      <h3 class="card-title">${title}</h3>
      <p class="card-author">${author}</p>
      <div class="card-foot">
        <span class="price">${formatPrice(book.price)}</span>
        <button class="btn view-btn" data-id="${escapeHtml(book.id)}">View Book</button>
      </div>
    </article>`;
}

/** The single-book detail view. Returns an HTML string. */
export function bookDetailHTML(book) {
  const title = escapeHtml(book.title);
  const cover = escapeHtml(book.coverImage);
  return `
    <div class="detail">
      <div
        class="detail-cover"
        role="img"
        aria-label="Cover of ${title}"
        style="background-color:#${escapeHtml(book.cover)};background-image:url('${cover}')"
      ></div>
      <div class="detail-body">
        <p class="detail-genre">${escapeHtml(book.genre)}</p>
        <h2>${title}</h2>
        <p class="detail-author">by ${escapeHtml(book.author)}</p>
        <p class="price detail-price">${formatPrice(book.price)}</p>
        <p class="detail-desc">${escapeHtml(book.description)}</p>
        <div class="detail-actions">
          <button class="btn" id="add-to-cart-btn" data-book-id="${escapeHtml(book.id)}">Add to Cart</button>
          <button class="btn ghost" id="back-btn">&larr; Back to catalogue</button>
        </div>
      </div>
    </div>`;
}

/** One cart line-item row. Returns an HTML string. */
export function cartItemHTML(item, title) {
  const lineTotal = Math.round(item.unitPrice * item.quantity * 100) / 100;
  return `
    <tr data-book-id="${escapeHtml(item.bookId)}" data-quantity="${item.quantity}">
      <td class="cart-item-title">${escapeHtml(title)}</td>
      <td>${formatPrice(item.unitPrice)}</td>
      <td class="cart-item-qty">
        <button class="btn qty-dec" data-book-id="${escapeHtml(item.bookId)}">&#8722;</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="btn qty-inc" data-book-id="${escapeHtml(item.bookId)}">+</button>
      </td>
      <td>${formatPrice(lineTotal)}</td>
      <td><button class="btn ghost cart-remove" data-book-id="${escapeHtml(item.bookId)}">Remove</button></td>
    </tr>`;
}

/** Order confirmation panel. Returns an HTML string. */
export function orderConfirmationHTML(order) {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.bookId)}</td>
        <td>${escapeHtml(String(item.quantity))}</td>
        <td>${formatPrice(item.unitPrice)}</td>
        <td>${formatPrice(Math.round(item.unitPrice * item.quantity * 100) / 100)}</td>
      </tr>`,
    )
    .join("");
  return `
    <h2 class="section-title">Order Confirmed!</h2>
    <p>Order ID: <code class="order-id">${escapeHtml(order.id)}</code></p>
    <table class="cart-table">
      <thead><tr><th>Book</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="cart-total">Grand Total: <strong>${formatPrice(order.total)}</strong></p>`;
}

// ---- DOM bootstrap: only runs in the browser, never during tests ----

/** cartId for the current session; null until the shopper first adds an item. */
let cartId = null;

/** Local cache of books keyed by id, populated on loadCatalogue. */
const bookMap = new Map();

async function loadCatalogue() {
  const grid = document.getElementById("book-grid");
  const res = await fetch("/api/books");
  const books = await res.json();
  for (const book of books) bookMap.set(book.id, book);
  grid.innerHTML = books.map(bookCardHTML).join("");
}

async function showDetail(id) {
  const view = document.getElementById("detail-view");
  const grid = document.getElementById("catalogue-view");
  const res = await fetch(`/api/books/${id}`);
  if (!res.ok) return;
  const book = await res.json();
  view.innerHTML = bookDetailHTML(book);
  grid.hidden = true;
  view.hidden = false;
}

/** Switch between the top-level views. */
function showView(view) {
  const isHome = view === "home";
  const isCart = view === "cart";
  document.getElementById("hero").hidden = !isHome;
  document.getElementById("catalogue-view").hidden = !isHome;
  document.getElementById("about-view").hidden = view !== "about";
  document.getElementById("detail-view").hidden = true;
  document.getElementById("cart-view").hidden = !isCart;
  document.getElementById("order-view").hidden = true;
  document.querySelectorAll(".nav a[data-view]").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
  if (isCart) renderCart();
}

function updateCartBadge(count) {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = String(count);
}

function applyCartToDOM(cart) {
  document.getElementById("cart-content").innerHTML = renderCartContent(cart);
  updateCartBadge(cart.items.reduce((sum, i) => sum + i.quantity, 0));
}

function renderCartContent(cart) {
  if (cart.items.length === 0) {
    return '<p class="cart-empty">Your cart is empty.</p><button class="btn ghost" id="cart-back-btn">&larr; Continue shopping</button>';
  }
  const rows = cart.items
    .map((item) => cartItemHTML(item, bookMap.get(item.bookId)?.title ?? item.bookId))
    .join("");
  const total = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return `
    <table class="cart-table">
      <thead><tr><th>Book</th><th>Unit Price</th><th>Qty</th><th>Line Total</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="cart-total">Total: <strong>${formatPrice(Math.round(total * 100) / 100)}</strong></p>
    <div class="cart-actions">
      <button class="btn" id="checkout-btn">Checkout</button>
      <button class="btn ghost" id="cart-back-btn">&larr; Continue shopping</button>
    </div>`;
}

async function renderCart() {
  const content = document.getElementById("cart-content");
  if (!cartId) {
    content.innerHTML =
      '<p class="cart-empty">Your cart is empty. Browse the catalogue to add books.</p>';
    return;
  }
  const res = await fetch(`/api/carts/${cartId}`);
  if (!res.ok) {
    cartId = null;
    content.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    return;
  }
  applyCartToDOM(await res.json());
}

async function addToCart(bookId) {
  if (!cartId) {
    const res = await fetch("/api/carts", { method: "POST" });
    cartId = (await res.json()).id;
  }
  const cartRes = await fetch(`/api/carts/${cartId}`);
  const cart = await cartRes.json();
  const existing = cart.items.find((i) => i.bookId === bookId);
  const res = await fetch(`/api/carts/${cartId}/items/${bookId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: existing ? existing.quantity + 1 : 1 }),
  });
  if (res.ok) {
    const updated = await res.json();
    updateCartBadge(updated.items.reduce((sum, i) => sum + i.quantity, 0));
  }
}

function wireEvents() {
  document.querySelector(".nav").addEventListener("click", (e) => {
    const link = e.target.closest("a[data-view]");
    if (!link) return;
    e.preventDefault();
    showView(link.dataset.view);
  });

  document.getElementById("book-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".view-btn");
    if (btn) showDetail(btn.dataset.id);
  });

  document.getElementById("detail-view").addEventListener("click", async (e) => {
    if (e.target.id === "back-btn") showView("home");
    if (e.target.id === "add-to-cart-btn") {
      const bookId = e.target.dataset.bookId;
      e.target.disabled = true;
      await addToCart(bookId);
      e.target.textContent = "Added!";
      setTimeout(() => {
        e.target.textContent = "Add to Cart";
        e.target.disabled = false;
      }, 1500);
    }
  });

  document.getElementById("cart-view").addEventListener("click", async (e) => {
    if (!cartId) {
      if (e.target.id === "cart-back-btn") showView("home");
      return;
    }
    const bookId = e.target.closest("[data-book-id]")?.dataset.bookId;

    if (e.target.closest(".qty-dec") && bookId) {
      const row = e.target.closest("tr[data-quantity]");
      const qty = parseInt(row?.dataset.quantity ?? "1", 10);
      if (qty > 1) {
        await fetch(`/api/carts/${cartId}/items/${bookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qty - 1 }),
        });
        await renderCart();
      }
      return;
    }

    if (e.target.closest(".qty-inc") && bookId) {
      const row = e.target.closest("tr[data-quantity]");
      const qty = parseInt(row?.dataset.quantity ?? "1", 10);
      await fetch(`/api/carts/${cartId}/items/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty + 1 }),
      });
      await renderCart();
      return;
    }

    if (e.target.closest(".cart-remove") && bookId) {
      await fetch(`/api/carts/${cartId}/items/${bookId}`, { method: "DELETE" });
      await renderCart();
      return;
    }

    if (e.target.id === "checkout-btn") {
      const res = await fetch(`/api/carts/${cartId}/checkout`, { method: "POST" });
      if (res.ok) {
        const order = await res.json();
        cartId = null;
        updateCartBadge(0);
        document.getElementById("cart-view").hidden = true;
        document.getElementById("order-view").hidden = false;
        document.getElementById("order-content").innerHTML = orderConfirmationHTML(order);
      } else {
        const { error } = await res.json();
        const errEl = document.createElement("p");
        errEl.className = "cart-error";
        errEl.textContent = error;
        document.getElementById("cart-content").prepend(errEl);
      }
      return;
    }

    if (e.target.id === "cart-back-btn") showView("home");
  });

  document.getElementById("order-view").addEventListener("click", (e) => {
    if (e.target.id === "order-back-btn") showView("home");
  });
}

if (typeof document !== "undefined" && document.getElementById("book-grid")) {
  wireEvents();
  loadCatalogue();
}
