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

/** Shared low-stock cue for catalogue cards and detail views. */
export function lowStockCueHTML(stock) {
  const count = Number(stock);
  if (!Number.isInteger(count) || count < 1 || count > 3) return "";
  const noun = count === 1 ? "copy" : "copies";
  return `<p class="low-stock">Only ${escapeHtml(count)} ${noun} left</p>`;
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
      ${lowStockCueHTML(book.stock)}
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
        ${lowStockCueHTML(book.stock)}
        <p class="detail-desc">${escapeHtml(book.description)}</p>
        <button class="btn ghost" id="back-btn">&larr; Back to catalogue</button>
      </div>
    </div>`;
}

// ---- DOM bootstrap: only runs in the browser, never during tests ----
async function loadCatalogue() {
  const grid = document.getElementById("book-grid");
  const res = await fetch("/api/books");
  const books = await res.json();
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

function showCatalogue() {
  document.getElementById("detail-view").hidden = true;
  document.getElementById("catalogue-view").hidden = false;
}

/** Switch between the top-level "home" and "about" views. */
function showView(view) {
  const isHome = view === "home";
  document.getElementById("hero").hidden = !isHome;
  document.getElementById("catalogue-view").hidden = !isHome;
  document.getElementById("about-view").hidden = isHome;
  document.getElementById("detail-view").hidden = true;
  document.querySelectorAll(".nav a[data-view]").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
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
  document.getElementById("detail-view").addEventListener("click", (e) => {
    if (e.target.id === "back-btn") showCatalogue();
  });
}

if (typeof document !== "undefined" && document.getElementById("book-grid")) {
  wireEvents();
  loadCatalogue();
}
