import { LANGS, LANG_NAMES, ITEMS, CATEGORIES, ALLERGENS, HOURS, HOURS_ROWS, MARQUEE } from "./data.js";
import { T, fill } from "./i18n.js";
import {
  detectLang, formatMoney, formatTime, openStatus, pickupSlots,
  setQty, cartCount, cartTotal, sanitizeCart, filterItems, orderCode
} from "./logic.js";

document.documentElement.classList.add("js");

/* ---------- storage (never throws: private mode, blocked storage) ---------- */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("halte:" + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("halte:" + key, JSON.stringify(value)); } catch { /* ignore */ }
  }
};

/* ---------- state ---------- */
const params = new URLSearchParams(location.search);
const state = {
  lang: LANGS.includes(params.get("lang")) ? params.get("lang") : store.get("lang", null) || detectLang(navigator.languages || [navigator.language]),
  cat: "coffee",
  vegan: false,
  gf: false,
  cart: sanitizeCart(store.get("cart", {}), ITEMS),
  slot: null,
  consent: store.get("consent", null),
  lastOrder: null
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const t = () => T[state.lang];
const money = (n) => formatMoney(n, state.lang);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- icons ---------- */
const ICONS = {
  coffee: '<svg aria-hidden="true" viewBox="0 0 72 72" fill="none" stroke="var(--ground)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 28h34v8a17 17 0 0 1-34 0z"/><path d="M48 31h3a6 6 0 0 1 0 12h-5"/><path d="M25 12c-3 4 3 7 0 11"/><path d="M36 12c-3 4 3 7 0 11"/><path d="M10 62h44"/></svg>',
  pastry: '<svg aria-hidden="true" viewBox="0 0 72 72" fill="none" stroke="var(--ground)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 46c5-17 19-26 28-26s23 9 28 26c-5 4-11 3-14-1-5 6-23 6-28 0-3 4-9 5-14 1z"/><path d="M29 22l5 21"/><path d="M43 22l-5 21"/></svg>',
  brunch: '<svg aria-hidden="true" viewBox="0 0 72 72" fill="none" stroke="var(--ground)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 34h54a27 27 0 0 1-54 0z"/><path d="M22 34c0-8 6-13 14-13s14 5 14 13"/><circle cx="36" cy="27" r="3"/><path d="M27 62h18"/></svg>',
  plus: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>'
};

/* ---------- static strings ---------- */
function applyStrings() {
  const s = t();
  document.documentElement.lang = state.lang;
  $$("[data-i18n]").forEach((el) => { if (s[el.dataset.i18n] != null) el.textContent = s[el.dataset.i18n]; });
  $$("[data-i18n-aria]").forEach((el) => { if (s[el.dataset.i18nAria] != null) el.setAttribute("aria-label", s[el.dataset.i18nAria]); });
}

function renderLangs() {
  $("#lang-switch").innerHTML = LANGS.map((code) =>
    `<button type="button" lang="${code}" data-lang="${code}" aria-label="${esc(LANG_NAMES[code])}" aria-pressed="${code === state.lang}">${code.toUpperCase()}</button>`
  ).join("");
}

function renderTabs() {
  $("#cat-tabs").innerHTML = CATEGORIES.map((c) =>
    `<button type="button" data-cat="${c}" aria-pressed="${c === state.cat}">${esc(t().cats[c])}</button>`
  ).join("");
  $$("#diet-chips .chip").forEach((b) => b.setAttribute("aria-pressed", String(state[b.dataset.diet])));
}

function itemFoot(item) {
  const q = state.cart[item.id] || 0;
  const name = item.name[state.lang];
  if (!q) return `<button type="button" class="add-btn" data-action="add" data-id="${item.id}" aria-label="${esc(t().add + ": " + name)}">${ICONS.plus}<span>${esc(t().add)}</span></button>`;
  return `<div class="stepper">
    <button type="button" data-action="dec" data-id="${item.id}" aria-label="${esc("−1 " + name)}">−</button>
    <output aria-live="polite">${q}</output>
    <button type="button" class="plus" data-action="inc" data-id="${item.id}" aria-label="${esc("+1 " + name)}">+</button>
  </div>`;
}

function renderMenu(animate = true) {
  const s = t();
  const list = filterItems(ITEMS, state);
  const grid = $("#menu-grid");
  grid.innerHTML = list.map((i) => {
    const allergens = i.al.length
      ? `<strong>${esc(s.contains)}</strong> ${esc(i.al.map((a) => ALLERGENS[a][state.lang]).join(", "))}`
      : esc(s.noAllergens);
    const tags = [i.vegan ? s.vegan : null, i.gf ? s.gf : null].filter(Boolean).map((x) => `<span class="tag">${esc(x)}</span>`).join("");
    return `<article class="item lift" data-item="${i.id}" ${animate ? "" : 'style="animation:none"'}>
      <div class="plate" data-cat="${i.cat}">${ICONS[i.cat]}<div class="tags">${tags}</div></div>
      <div class="item-head"><h3>${esc(i.name[state.lang])}</h3><span class="price">${esc(money(i.price))}</span></div>
      <p class="desc">${esc(i.desc[state.lang])}</p>
      <p class="al">${allergens}</p>
      <div class="item-foot" data-foot="${i.id}">${itemFoot(i)}</div>
    </article>`;
  }).join("");
  $("#menu-empty").hidden = list.length > 0;
}

/** Re-render one card's add/stepper area and keep keyboard focus sensible. */
function refreshFoot(id, lastAction) {
  const foot = $(`[data-foot="${id}"]`);
  if (!foot) return;
  const item = ITEMS.find((i) => i.id === id);
  const hadFocus = foot.contains(document.activeElement);
  foot.innerHTML = itemFoot(item);
  if (hadFocus) {
    const target = $(`[data-action="${lastAction}"]`, foot) || $(`[data-action="inc"]`, foot) || $(`[data-action="add"]`, foot);
    target && target.focus();
  }
}

function renderCart() {
  const s = t();
  const count = cartCount(state.cart);
  const total = cartTotal(state.cart, ITEMS);
  const lines = ITEMS.filter((i) => state.cart[i.id]);
  $("#cart-lines").innerHTML = lines.map((i) => {
    const q = state.cart[i.id];
    const name = i.name[state.lang];
    return `<li>
      <span class="line-name">${esc(name)}<small>${esc(money(i.price))}</small></span>
      <span class="mini">
        <button type="button" data-action="dec" data-id="${i.id}" aria-label="${esc("−1 " + name)}">−</button>
        <output>${q}</output>
        <button type="button" data-action="inc" data-id="${i.id}" aria-label="${esc("+1 " + name)}">+</button>
      </span>
      <span class="line-sum">${esc(money(q * i.price))}</span>
    </li>`;
  }).join("");
  $("#cart-empty").hidden = count > 0;
  $("#cart-total").textContent = money(total);
  $("#mobile-total").textContent = money(total);
  $$("[data-count]").forEach((el) => {
    if (el.textContent !== String(count) && !reduceMotion) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    el.textContent = String(count);
  });
  $("#mobile-bar").hidden = count === 0 || !!state.lastOrder;
  if (count > 0) $("#form-error").textContent = $("#form-error").dataset.kind === "empty" ? "" : $("#form-error").textContent;
}

function renderSlots() {
  const { day, slots } = pickupSlots(new Date());
  if (!slots.includes(state.slot)) state.slot = slots[0] ?? null;
  $("#slot-day").textContent = day === "today" ? t().today : t().tomorrow;
  $("#slots").innerHTML = slots.map((m) =>
    `<button type="button" data-slot="${m}" aria-pressed="${m === state.slot}">${formatTime(m, state.lang)}</button>`
  ).join("");
  state.slotDay = day;
}

function renderHours() {
  const today = new Date().getDay();
  $("#hours").innerHTML = HOURS_ROWS.map((row, k) => {
    const [o, c] = HOURS[row.ref];
    const isToday = row.days.includes(today);
    return `<li class="${isToday ? "today" : ""}">
      <span class="day">${esc(t().days[k])}${isToday ? `<span class="today-tag">${esc(t().today)}</span>` : ""}</span>
      <time>${formatTime(o, state.lang)}–${formatTime(c, state.lang)}</time>
    </li>`;
  }).join("");
}

function renderStatus() {
  const s = t();
  const st = openStatus(new Date());
  const kicker = st.open
    ? fill(s.kickerOpen, { time: formatTime(st.until, state.lang) })
    : fill(s.kickerClosed, { when: st.opensDay === "today" ? s.whenToday : s.whenTomorrow, time: formatTime(st.opensAt, state.lang) });
  $("#hero-kicker").textContent = kicker;
  $("#hero-dot").classList.toggle("closed", !st.open);
  $("#visit-dot").classList.toggle("closed", !st.open);
  $("#visit-status").textContent = st.open ? s.openNow : s.closedNow;
}

function renderMarquee() {
  const words = MARQUEE.concat(MARQUEE);
  $("#marquee").innerHTML = words.map((w) => `<span>${esc(w)}<i></i></span>`).join("");
}

function renderDone() {
  const o = state.lastOrder;
  $("#order-done").hidden = !o;
  $("#order-form").hidden = !!o;
  if (!o) return;
  const s = t();
  $("#done-code").textContent = o.code;
  $("#done-meta").textContent = `${o.name} · ${s.pickupAt}: ${o.day === "today" ? s.today : s.tomorrow} ${formatTime(o.slot, state.lang)} · ${money(o.total)}`;
}

function renderAll(animateMenu = true) {
  applyStrings();
  renderLangs();
  renderTabs();
  renderMenu(animateMenu);
  renderCart();
  renderSlots();
  renderHours();
  renderStatus();
  renderDone();
}

/* ---------- actions ---------- */
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

function changeQty(id, delta, action) {
  const prev = state.cart[id] || 0;
  state.cart = setQty(state.cart, id, prev + delta);
  store.set("cart", state.cart);
  refreshFoot(id, action);
  renderCart();
  if (delta > 0 && prev === 0) toast(t().added);
}

function setLang(code) {
  state.lang = code;
  store.set("lang", code);
  const url = new URL(location.href);
  url.searchParams.set("lang", code);
  history.replaceState(null, "", url);
  renderAll(false);
  $(`[data-lang="${code}"]`).focus();
}

function showCookie(show, focus = false) {
  $("#cookie").hidden = !show;
  if (show && focus) $("#cookie [data-consent]").focus({ preventScroll: true });
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const el = e.target.closest("button");
  if (!el) return;
  if (el.dataset.lang) return setLang(el.dataset.lang);
  if (el.dataset.cat) { state.cat = el.dataset.cat; renderTabs(); renderMenu(); return; }
  if (el.dataset.diet) { state[el.dataset.diet] = !state[el.dataset.diet]; renderTabs(); renderMenu(); return; }
  if (el.dataset.action && el.dataset.id) {
    const d = { add: 1, inc: 1, dec: -1 }[el.dataset.action];
    const inPanel = !!el.closest("#cart-lines");
    changeQty(el.dataset.id, d, el.dataset.action);
    if (inPanel) {
      const again = $(`#cart-lines [data-action="${el.dataset.action}"][data-id="${el.dataset.id}"]`);
      (again || $("#order-name")).focus();
    }
    return;
  }
  if (el.dataset.slot) {
    state.slot = Number(el.dataset.slot);
    $$("#slots button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.slot) === state.slot)));
    return;
  }
  if (el.dataset.consent) {
    state.consent = el.dataset.consent;
    store.set("consent", state.consent);
    showCookie(false);
    // Analytics would be loaded here only when consent === "all".
    return;
  }
  if (el.id === "open-cookies") return showCookie(true, true);
  if (el.id === "new-order") {
    state.lastOrder = null;
    renderDone();
    renderCart();
    $("#order-name").focus();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#cookie").hidden && state.consent) showCookie(false);
});

$("#order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $("#form-error");
  const nameEl = $("#order-name");
  const name = nameEl.value.trim();
  if (cartCount(state.cart) === 0) { err.dataset.kind = "empty"; err.textContent = t().emptyError; return; }
  if (!name) {
    err.dataset.kind = "name"; err.textContent = t().nameError;
    nameEl.setAttribute("aria-invalid", "true"); nameEl.focus();
    return;
  }
  nameEl.removeAttribute("aria-invalid");
  err.textContent = "";
  state.lastOrder = { code: orderCode(), name, slot: state.slot, day: state.slotDay, total: cartTotal(state.cart, ITEMS) };
  store.set("lastOrder", state.lastOrder);
  state.cart = {};
  store.set("cart", state.cart);
  renderMenu(false);
  renderCart();
  renderDone();
  $("#order").scrollIntoView({ block: "start" });
  $("#new-order").focus({ preventScroll: true });
});

$("#order-name").addEventListener("input", (e) => {
  if (e.target.value.trim()) { e.target.removeAttribute("aria-invalid"); if ($("#form-error").dataset.kind === "name") $("#form-error").textContent = ""; }
});

/* Hero: subtle parallax on the cup */
if (!reduceMotion) {
  const art = $("#hero-art");
  $(".hero").addEventListener("pointermove", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    art.style.transform = `translate(${x * 18}px, ${y * 14}px) rotate(${x * 3}deg)`;
  });
  $(".hero").addEventListener("pointerleave", () => { art.style.transform = ""; });
}

/* Scroll reveal */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("in"));
}

/* ---------- boot ---------- */
$("#year").textContent = String(new Date().getFullYear());
renderMarquee();
renderAll();
if (!state.consent) showCookie(true);

// Keep "open now", hours highlight and pick-up slots current.
setInterval(() => { renderStatus(); renderHours(); renderSlots(); }, 60_000);
