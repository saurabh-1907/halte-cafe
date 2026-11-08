// Content for the Halte café site. Menu items, prices and hours are sample
// content: replace them with the real café's data before going live.

export const LANGS = ["en", "de", "fr", "it"];

export const LOCALES = { en: "en-IE", de: "de-DE", fr: "fr-FR", it: "it-IT" };

export const LANG_NAMES = { en: "English", de: "Deutsch", fr: "Français", it: "Italiano" };

// Opening hours in minutes after midnight, indexed by Date#getDay() (0 = Sunday).
export const HOURS = [
  [540, 900], // Sun 09:00–15:00
  [450, 1080], // Mon 07:30–18:00
  [450, 1080],
  [450, 1080],
  [450, 1080],
  [450, 1080], // Fri
  [510, 1020] // Sat 08:30–17:00
];

// Rows shown in the "Opening hours" card: label key index into t.days + the weekdays they cover.
export const HOURS_ROWS = [
  { days: [1, 2, 3, 4, 5], ref: 1 },
  { days: [6], ref: 6 },
  { days: [0], ref: 0 }
];

export const ALLERGENS = {
  gluten: { en: "Gluten", de: "Gluten", fr: "Gluten", it: "Glutine" },
  milk: { en: "Milk", de: "Milch", fr: "Lait", it: "Latte" },
  egg: { en: "Egg", de: "Ei", fr: "Œuf", it: "Uova" },
  nuts: { en: "Nuts", de: "Schalenfrüchte", fr: "Fruits à coque", it: "Frutta a guscio" }
};

export const CATEGORIES = ["coffee", "pastry", "brunch"];

export const ITEMS = [
  { id: "espresso", cat: "coffee", price: 2.4, vegan: true, gf: true, al: [],
    name: { en: "Espresso", de: "Espresso", fr: "Espresso", it: "Espresso" },
    desc: { en: "Double shot of a seasonal single origin.", de: "Doppelter Shot, saisonale Single Origin.", fr: "Double, origine unique de saison.", it: "Doppio, monorigine di stagione." } },
  { id: "flatwhite", cat: "coffee", price: 3.6, vegan: false, gf: true, al: ["milk"],
    name: { en: "Flat white", de: "Flat White", fr: "Flat white", it: "Flat white" },
    desc: { en: "Silky whole milk over a ristretto base.", de: "Seidige Vollmilch auf Ristretto.", fr: "Lait entier soyeux sur base ristretto.", it: "Latte intero vellutato su base ristretto." } },
  { id: "oatcortado", cat: "coffee", price: 3.4, vegan: true, gf: false, al: ["gluten"],
    name: { en: "Oat cortado", de: "Hafer-Cortado", fr: "Cortado à l’avoine", it: "Cortado all’avena" },
    desc: { en: "Equal parts espresso and oat milk.", de: "Espresso und Hafermilch zu gleichen Teilen.", fr: "Espresso et lait d’avoine à parts égales.", it: "Espresso e latte d’avena in parti uguali." } },
  { id: "cardamomlatte", cat: "coffee", price: 4.1, vegan: false, gf: true, al: ["milk"],
    name: { en: "Cardamom latte", de: "Kardamom-Latte", fr: "Latte à la cardamome", it: "Latte al cardamomo" },
    desc: { en: "Freshly ground cardamom, a touch of honey.", de: "Frisch gemahlener Kardamom, etwas Honig.", fr: "Cardamome moulue minute, touche de miel.", it: "Cardamomo macinato al momento, un filo di miele." } },
  { id: "croissant", cat: "pastry", price: 2.8, vegan: false, gf: false, al: ["gluten", "milk", "egg"],
    name: { en: "Butter croissant", de: "Buttercroissant", fr: "Croissant au beurre", it: "Cornetto al burro" },
    desc: { en: "Laminated by hand, baked every morning.", de: "Von Hand tourniert, jeden Morgen gebacken.", fr: "Feuilleté à la main, cuit chaque matin.", it: "Sfogliato a mano, sfornato ogni mattina." } },
  { id: "bun", cat: "pastry", price: 3.5, vegan: false, gf: false, al: ["gluten", "milk", "egg"],
    name: { en: "Cardamom bun", de: "Kardamomschnecke", fr: "Brioche à la cardamome", it: "Brioche al cardamomo" },
    desc: { en: "Swedish-style knot with pearl sugar.", de: "Schwedischer Knoten mit Hagelzucker.", fr: "Nœud à la suédoise, sucre perlé.", it: "Nodo alla svedese con granella di zucchero." } },
  { id: "orangecake", cat: "pastry", price: 3.2, vegan: true, gf: false, al: ["gluten"],
    name: { en: "Olive oil orange cake", de: "Olivenöl-Orangenkuchen", fr: "Gâteau orange & huile d’olive", it: "Torta arancia e olio d’oliva" },
    desc: { en: "Whole oranges, no dairy or eggs.", de: "Ganze Orangen, ohne Milch und Ei.", fr: "Oranges entières, sans lait ni œufs.", it: "Arance intere, senza latte né uova." } },
  { id: "eggs", cat: "brunch", price: 10.5, vegan: false, gf: false, al: ["gluten", "egg", "milk"],
    name: { en: "Soft eggs on sourdough", de: "Weiche Eier auf Sauerteig", fr: "Œufs mollets sur pain au levain", it: "Uova morbide su lievito madre" },
    desc: { en: "Brown butter, chives, flaky salt.", de: "Nussbutter, Schnittlauch, Flockensalz.", fr: "Beurre noisette, ciboulette, fleur de sel.", it: "Burro nocciola, erba cipollina, sale in fiocchi." } },
  { id: "galette", cat: "brunch", price: 11.2, vegan: false, gf: true, al: ["milk", "egg"],
    name: { en: "Buckwheat galette", de: "Buchweizen-Galette", fr: "Galette de sarrasin", it: "Galette di grano saraceno" },
    desc: { en: "Mushrooms, comté and a fried egg.", de: "Pilze, Comté und Spiegelei.", fr: "Champignons, comté et œuf miroir.", it: "Funghi, comté e uovo all’occhio di bue." } },
  { id: "granola", cat: "brunch", price: 7.9, vegan: true, gf: false, al: ["gluten", "nuts"],
    name: { en: "Granola bowl", de: "Granola-Bowl", fr: "Bol de granola", it: "Ciotola di granola" },
    desc: { en: "Oat yoghurt, roasted hazelnuts, berries.", de: "Haferjoghurt, geröstete Haselnüsse, Beeren.", fr: "Yaourt d’avoine, noisettes torréfiées, baies.", it: "Yogurt d’avena, nocciole tostate, frutti di bosco." } }
];

export const MARQUEE = ["Espresso", "Kaffee", "Café", "Caffè", "Kanelbulle", "Croissant", "Cortado", "Galette", "Cornetto", "Flat white"];
