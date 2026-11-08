import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectLang, formatMoney, formatTime, isOpenAt, openStatus, pickupSlots,
  setQty, cartCount, cartTotal, sanitizeCart, filterItems, orderCode
} from "../js/logic.js";
import { ITEMS } from "../js/data.js";
import { T, fill } from "../js/i18n.js";

// 2026-11-09 is a Monday; 2026-11-14 a Saturday; 2026-11-15 a Sunday.
const at = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h, mi);

test("detectLang picks the first supported base language", () => {
  assert.equal(detectLang(["nl-NL", "de-AT", "en"]), "de");
  assert.equal(detectLang(["fr-CA"]), "fr");
  assert.equal(detectLang(["pt-PT", "es"]), "en");
  assert.equal(detectLang([]), "en");
});

test("formatMoney uses European conventions per locale", () => {
  const nb = (s) => s.replace(/ | /g, " ");
  assert.equal(formatMoney(3.4, "en"), "€3.40");
  assert.equal(nb(formatMoney(3.4, "de")), "3,40 €");
  assert.equal(nb(formatMoney(3.4, "fr")), "3,40 €");
  assert.equal(nb(formatMoney(3.4, "it")), "3,40 €");
});

test("formatTime is 24-hour, French uses h", () => {
  assert.equal(formatTime(450, "en"), "07:30");
  assert.equal(formatTime(1080, "de"), "18:00");
  assert.equal(formatTime(450, "fr"), "07h30");
});

test("opening status across the week", () => {
  assert.equal(isOpenAt(at(2026, 11, 9, 7, 29)), false);
  assert.equal(isOpenAt(at(2026, 11, 9, 7, 30)), true);
  assert.equal(isOpenAt(at(2026, 11, 9, 18, 0)), false);
  assert.deepEqual(openStatus(at(2026, 11, 9, 9, 0)), { open: true, until: 1080 });
  assert.deepEqual(openStatus(at(2026, 11, 9, 6, 0)), { open: false, opensDay: "today", opensAt: 450 });
  // Saturday evening → opens Sunday 09:00
  assert.deepEqual(openStatus(at(2026, 11, 14, 19, 0)), { open: false, opensDay: "tomorrow", opensAt: 540 });
});

test("pickupSlots respects lead time, last order and rolls over to tomorrow", () => {
  const morning = pickupSlots(at(2026, 11, 9, 8, 10));
  assert.equal(morning.day, "today");
  assert.equal(morning.slots[0], 510); // 08:30 (08:10 + 15 min lead → first slot 08:30)
  assert.equal(morning.slots.at(-1), 1050); // 17:30 = close 18:00 − 30
  const late = pickupSlots(at(2026, 11, 15, 14, 50)); // Sunday, closes 15:00
  assert.equal(late.day, "tomorrow");
  assert.equal(late.slots[0], 450); // Monday 07:30
});

test("cart helpers", () => {
  let c = {};
  c = setQty(c, "espresso", 2);
  c = setQty(c, "croissant", 1);
  assert.equal(cartCount(c), 3);
  assert.equal(cartTotal(c, ITEMS), 7.6);
  c = setQty(c, "espresso", 0);
  assert.deepEqual(c, { croissant: 1 });
  assert.equal(setQty({}, "x", 500).x, 99);
});

test("cartTotal avoids floating point drift", () => {
  assert.equal(cartTotal({ flatwhite: 3, oatcortado: 3 }, ITEMS), 21);
  assert.equal(cartTotal({ granola: 7 }, ITEMS), 55.3);
});

test("sanitizeCart drops junk from storage", () => {
  assert.deepEqual(sanitizeCart({ espresso: 2, nope: 1, bun: -1, galette: 1.5, eggs: "3" }, ITEMS), { espresso: 2 });
  assert.deepEqual(sanitizeCart(null, ITEMS), {});
});

test("filterItems by category and diet", () => {
  assert.deepEqual(filterItems(ITEMS, { cat: "coffee", vegan: true }).map((i) => i.id), ["espresso", "oatcortado"]);
  assert.deepEqual(filterItems(ITEMS, { cat: "brunch", gf: true }).map((i) => i.id), ["galette"]);
  assert.deepEqual(filterItems(ITEMS, { cat: "pastry", vegan: true, gf: true }), []);
});

test("orderCode format", () => {
  assert.equal(orderCode(() => 0), "H-1000");
  assert.equal(orderCode(() => 0.99999), "H-9999");
  assert.match(orderCode(), /^H-\d{4}$/);
});

test("every language has every key and every item is translated", () => {
  const keys = Object.keys(T.en);
  for (const lang of ["de", "fr", "it"]) {
    for (const k of keys) assert.ok(k in T[lang], `${lang} missing ${k}`);
  }
  for (const i of ITEMS) for (const lang of ["en", "de", "fr", "it"]) {
    assert.ok(i.name[lang] && i.desc[lang], `${i.id} missing ${lang}`);
  }
  assert.equal(fill("bis {time}", { time: "18:00" }), "bis 18:00");
});
