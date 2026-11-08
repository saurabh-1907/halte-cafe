// Pure, DOM-free logic so it can be unit-tested with `node --test`.

import { LOCALES, LANGS, HOURS } from "./data.js";

/** Pick a supported language from a list of browser language tags. */
export function detectLang(candidates = [], fallback = "en") {
  for (const tag of candidates) {
    const base = String(tag || "").toLowerCase().split("-")[0];
    if (LANGS.includes(base)) return base;
  }
  return fallback;
}

/** Format a euro amount the way each locale expects (en: €3.40, de/fr/it: 3,40 €). */
export function formatMoney(amount, lang) {
  return new Intl.NumberFormat(LOCALES[lang] || LOCALES.en, { style: "currency", currency: "EUR" }).format(amount);
}

/** Minutes after midnight → "07:30" (or "07h30" in French). */
export function formatTime(minutes, lang) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return lang === "fr" ? `${h}h${m}` : `${h}:${m}`;
}

export function minutesOf(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/** Is the café open at `date`? */
export function isOpenAt(date, hours = HOURS) {
  const [open, close] = hours[date.getDay()];
  const m = minutesOf(date);
  return m >= open && m < close;
}

/**
 * Status used by the hero badge and the "Visit" pill.
 * Returns { open, until } when open, or { open: false, opensDay: "today"|"tomorrow", opensAt }.
 */
export function openStatus(date, hours = HOURS) {
  const [open, close] = hours[date.getDay()];
  const m = minutesOf(date);
  if (m >= open && m < close) return { open: true, until: close };
  if (m < open) return { open: false, opensDay: "today", opensAt: open };
  const next = hours[(date.getDay() + 1) % 7];
  return { open: false, opensDay: "tomorrow", opensAt: next[0] };
}

/**
 * Pick-up slots every `step` minutes inside opening hours, at least `lead`
 * minutes from now and no later than `lastOrder` minutes before closing.
 * Falls back to tomorrow when nothing is left today.
 */
export function pickupSlots(date, { hours = HOURS, step = 30, lead = 15, lastOrder = 30 } = {}) {
  const build = (dayIdx, from) => {
    const [open, close] = hours[dayIdx];
    const out = [];
    for (let t = open; t <= close - lastOrder; t += step) if (t >= from) out.push(t);
    return out;
  };
  const today = build(date.getDay(), minutesOf(date) + lead);
  if (today.length) return { day: "today", slots: today };
  return { day: "tomorrow", slots: build((date.getDay() + 1) % 7, 0) };
}

/** Return a new cart with item `id` set to `qty` (removed when qty <= 0). */
export function setQty(cart, id, qty) {
  const next = { ...cart };
  const q = Math.max(0, Math.min(99, Math.floor(qty)));
  if (q === 0) delete next[id];
  else next[id] = q;
  return next;
}

export function cartCount(cart) {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

/** Total in euros, rounded to cents. Unknown ids are ignored. */
export function cartTotal(cart, items) {
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const cents = Object.entries(cart).reduce((sum, [id, q]) => sum + (byId[id] ? Math.round(byId[id].price * 100) * q : 0), 0);
  return cents / 100;
}

/** Drop unknown ids and invalid quantities from a cart read from storage. */
export function sanitizeCart(raw, items) {
  const ids = new Set(items.map((i) => i.id));
  const out = {};
  if (raw && typeof raw === "object") {
    for (const [id, q] of Object.entries(raw)) {
      if (ids.has(id) && Number.isInteger(q) && q > 0 && q < 100) out[id] = q;
    }
  }
  return out;
}

export function filterItems(items, { cat, vegan = false, gf = false }) {
  return items.filter((i) => i.cat === cat && (!vegan || i.vegan) && (!gf || i.gf));
}

/** Short pick-up code such as "H-4821". */
export function orderCode(rand = Math.random) {
  return "H-" + String(1000 + Math.floor(rand() * 9000));
}
