/* =========================================================
   CHIKEN Y.A. — main.js
   Filtros del menú, carrito y envío del pedido por WhatsApp.
   ========================================================= */

const WHATSAPP_NUMBER = "59169243447";

/* ---------- Estado del carrito ---------- */
let cart = []; // [{ name, price, qty }]

/* ---------- Elementos ---------- */
const cartPanel = document.getElementById("cartPanel");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");

/* ---------- Carrito: abrir / cerrar ---------- */
function openCart() {
  cartPanel.classList.add("open");
  cartBackdrop.classList.add("open");
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartBackdrop.classList.remove("open");
}

if (openCartBtn) openCartBtn.addEventListener("click", openCart);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
if (cartBackdrop) cartBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

/* ---------- Carrito: lógica ---------- */
function addToCart(name, price) {
  const found = cart.find((item) => item.name === name);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
}

function changeQty(name, delta) {
  const item = cart.find((i) => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.name !== name);
  renderCart();
}

function removeItem(name) {
  cart = cart.filter((i) => i.name !== name);
  renderCart();
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function renderCart() {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  cartCount.textContent = count;
  cartTotal.textContent = "Bs " + total;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Todavía no agregaste productos.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item) => {
    const name = escapeHTML(item.name);
    return `
      <div class="cart-line">
        <div>
          <b>${name}</b><br>
          <small>Bs ${item.price} c/u</small>
        </div>
        <button class="remove-item" type="button" data-action="minus" data-name="${name}" aria-label="Quitar uno">−</button>
        <b>${item.qty}</b>
        <button class="remove-item" type="button" data-action="plus" data-name="${name}" aria-label="Agregar uno">＋</button>
        <button class="remove-item" type="button" data-action="remove" data-name="${name}" aria-label="Eliminar ${name}">🗑</button>
      </div>`;
  }).join("");
}

/* Botones dentro del carrito (+, −, eliminar) */
cartItems.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const name = btn.dataset.name;
  // data-name viene escapado; lo comparamos con los nombres reales del carrito
  const item = cart.find((i) => escapeHTML(i.name) === name);
  if (!item) return;
  if (btn.dataset.action === "plus") changeQty(item.name, 1);
  if (btn.dataset.action === "minus") changeQty(item.name, -1);
  if (btn.dataset.action === "remove") removeItem(item.name);
});

/* ---------- Notificación (esquina superior derecha) ---------- */
let toastContainer = document.getElementById("toastContainer");
if (!toastContainer) {
  toastContainer = document.createElement("div");
  toastContainer.id = "toastContainer";
  toastContainer.className = "toast-container";
  toastContainer.setAttribute("aria-live", "polite");
  document.body.appendChild(toastContainer);
}

function showToast(productName) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = '<span class="toast-icon">✓</span><span><b>Agregado con éxito</b><br>' +
    escapeHTML(productName) + "</span>";
  toastContainer.appendChild(toast);

  // animación de entrada y salida automática
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* Botones "＋ Agregar" del menú y de las promos */
document.querySelectorAll(".add-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    addToCart(btn.dataset.name, Number(btn.dataset.price));
    showToast(btn.dataset.name);
  });
});

/* ---------- Enviar pedido por WhatsApp ---------- */
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Primero agrega algún producto al carrito 🍗");
      return;
    }
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const lines = cart.map((i) => `• ${i.qty} x ${i.name} — Bs ${i.price * i.qty}`);
    const message =
      "Hola CHIKEN Y.A., quiero hacer este pedido:\n\n" +
      lines.join("\n") +
      `\n\nTotal: Bs ${total}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
}

/* ---------- Menú: filtros por categoría ---------- */
const filterButtons = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll("#productGrid .product-card");

function applyFilter(category) {
  filterButtons.forEach((b) =>
    b.classList.toggle("active", b.dataset.filter === category)
  );
  productCards.forEach((card) => {
    const show = category === "Todos" || card.dataset.category === category;
    card.style.display = show ? "" : "none";
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
});

/* Tarjetas de "¿Qué se te antoja hoy?" → filtran el menú */
document.querySelectorAll(".quick-card[data-category]").forEach((card) => {
  card.addEventListener("click", () => applyFilter(card.dataset.category));
});

/* ---------- Año del footer ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Primer render */
renderCart();
