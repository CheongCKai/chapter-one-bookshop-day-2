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
        <button class="btn add-btn" data-id="${escapeHtml(book.id)}" ${book.stock > 0 ? "" : "disabled"}>Add to cart</button>
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
        <button class="btn add-btn" data-id="${escapeHtml(book.id)}" ${book.stock > 0 ? "" : "disabled"}>Add to cart</button>
        <button class="btn ghost" id="back-btn">&larr; Back to catalogue</button>
      </div>
    </div>`;
}

/** A confirmed cart snapshot, rendered without side effects. */
export function cartHTML(cart) {
  const lines = cart.items
    .map(
      (item) => `
    <li class="cart-line" data-id="${escapeHtml(item.bookId)}">
      <h3>${escapeHtml(item.title)}</h3>
      <p>Unit price: ${formatPrice(item.unitPrice)}</p>
      <label>Quantity
        <input class="cart-quantity" type="number" min="1" step="1" value="${escapeHtml(item.quantity)}" aria-label="Quantity for ${escapeHtml(item.title)}">
      </label>
      <span class="price">Line total: ${formatPrice(item.lineTotal)}</span>
      <button class="btn update-btn" data-id="${escapeHtml(item.bookId)}">Update</button>
      <button class="btn remove-btn" data-id="${escapeHtml(item.bookId)}">Remove</button>
    </li>`,
    )
    .join("");
  return `
    ${cart.items.length ? `<ul class="cart-lines">${lines}</ul>` : "<p>Your cart is empty.</p>"}
    <p class="cart-total">Total: ${formatPrice(cart.total)}</p>
    <button class="btn ghost" id="cart-back-btn">&larr; Back to catalogue</button>`;
}

// ---- DOM bootstrap: guarded so importing pure helpers never touches a DOM ----
let confirmedCart = null;
let cartQueue = Promise.resolve();

function setStatus(message) {
  document.getElementById("cart-status").textContent = message;
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const error = new Error(body?.error ?? "The request failed. Please try again.");
    error.status = response.status;
    throw error;
  }
  return body;
}

function renderCart() {
  if (confirmedCart) {
    document.getElementById("cart-content").innerHTML = cartHTML(confirmedCart);
  }
}

async function ensureCart() {
  if (!confirmedCart) confirmedCart = await api("/api/carts", { method: "POST" });
  return confirmedCart;
}

// One queue covers lazy creation, reads and mutations. A failed request is
// caught here so it cannot poison later actions or replace confirmed data.
function cartAction(action) {
  cartQueue = cartQueue.then(async () => {
    const view = document.getElementById("cart-view");
    view.setAttribute("aria-busy", "true");
    setStatus("Updating cart…");
    try {
      await action();
      renderCart();
      setStatus("Cart updated.");
    } catch (error) {
      setStatus(error.message);
      if (error.status === 404) {
        document.getElementById("new-cart-btn").hidden = false;
      }
    } finally {
      view.setAttribute("aria-busy", "false");
    }
  });
}

function addToCart(bookId) {
  cartAction(async () => {
    const cart = await ensureCart();
    confirmedCart = await api(`/api/carts/${encodeURIComponent(cart.cartId)}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, quantity: 1 }),
    });
  });
}

async function loadCatalogue() {
  try {
    const books = await api("/api/books");
    document.getElementById("book-grid").innerHTML = books.map(bookCardHTML).join("");
  } catch (error) {
    setStatus(error.message);
  }
}

async function showDetail(id) {
  try {
    const book = await api(`/api/books/${encodeURIComponent(id)}`);
    showView("home");
    const view = document.getElementById("detail-view");
    view.innerHTML = bookDetailHTML(book);
    document.getElementById("catalogue-view").hidden = true;
    view.hidden = false;
  } catch (error) {
    setStatus(error.message);
  }
}

function showView(view) {
  const isHome = view === "home";
  document.getElementById("hero").hidden = !isHome;
  document.getElementById("catalogue-view").hidden = !isHome;
  document.getElementById("about-view").hidden = view !== "about";
  document.getElementById("cart-view").hidden = view !== "cart";
  document.getElementById("detail-view").hidden = true;
  document.querySelectorAll(".nav a[data-view]").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
}

function wireEvents() {
  document.querySelector(".nav").addEventListener("click", (event) => {
    const link = event.target.closest("a[data-view]");
    if (!link) return;
    event.preventDefault();
    showView(link.dataset.view);
    if (link.dataset.view === "cart") {
      cartAction(async () => {
        const cart = await ensureCart();
        confirmedCart = await api(`/api/carts/${encodeURIComponent(cart.cartId)}`);
      });
    }
  });
  document.getElementById("book-grid").addEventListener("click", (event) => {
    const add = event.target.closest(".add-btn");
    if (add && !add.disabled) addToCart(add.dataset.id);
    const view = event.target.closest(".view-btn");
    if (view) showDetail(view.dataset.id);
  });
  document.getElementById("detail-view").addEventListener("click", (event) => {
    const add = event.target.closest(".add-btn");
    if (add && !add.disabled) addToCart(add.dataset.id);
    if (event.target.id === "back-btn") showView("home");
  });
  document.getElementById("cart-view").addEventListener("click", (event) => {
    if (event.target.id === "cart-back-btn") showView("home");
    const update = event.target.closest(".update-btn");
    const remove = event.target.closest(".remove-btn");
    if (!update && !remove) return;
    const bookId = (update ?? remove).dataset.id;
    const quantity = update
      ? Number(update.closest(".cart-line").querySelector(".cart-quantity").value)
      : null;
    cartAction(async () => {
      const cart = await ensureCart();
      const path = `/api/carts/${encodeURIComponent(cart.cartId)}/items/${encodeURIComponent(bookId)}`;
      if (update) {
        confirmedCart = await api(path, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
      } else {
        await api(path, { method: "DELETE" });
        confirmedCart = await api(`/api/carts/${encodeURIComponent(cart.cartId)}`);
      }
    });
  });
  document.getElementById("new-cart-btn").addEventListener("click", () => {
    cartAction(async () => {
      const replacement = await api("/api/carts", { method: "POST" });
      confirmedCart = replacement;
      document.getElementById("new-cart-btn").hidden = true;
    });
  });
}

if (typeof document !== "undefined" && document.getElementById("book-grid")) {
  wireEvents();
  loadCatalogue();
}
