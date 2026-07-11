/* =========================================================
   menu-data.js — single source of truth for the menu.
   Plain globals (no ES modules) so it works over file://.
   Edit prices/items here; the menu page and cart both read this.
   ========================================================= */
window.MENU_DATA = [
  {
    id: "caviar", idx: "I", label: "Caviar & Raw Bar",
    items: [
      { id: "osc",  name: "Oscietra Caviar Service", price: 120, tag: "30g", desc: "Warm blinis, crème fraîche, chive, mother-of-pearl spoon." },
      { id: "kal",  name: "Kaluga Caviar",            price: 180, tag: "50g", desc: "Buttery, large pearl — served on crushed ice with traditional garnish." },
      { id: "oys",  name: "Kumamoto Oysters",         price: 36,            desc: "Half dozen, champagne mignonette, finger lime." },
      { id: "tuna", name: "Bluefin Tuna Crudo",       price: 42,            desc: "Soy-cured yolk, smoked dashi, wasabi leaf." },
      { id: "scal", name: "Hokkaido Scallop Carpaccio", price: 38,          desc: "Yuzu, brown butter, trout roe, micro shiso." },
      { id: "tower",name: "Le Plateau Royal",         price: 165, tag: "For Two", desc: "Lobster, oysters, prawns, crab, tuna — a tower of the cold sea." },
    ],
  },
  {
    id: "first", idx: "II", label: "First Courses",
    items: [
      { id: "foie", name: "Seared Foie Gras",      price: 38, desc: "Spiced fig, brioche, aged balsamic, fleur de sel." },
      { id: "beet", name: "Heirloom Beet Crudo",   price: 26, desc: "Goat curd, pistachio, blood orange, basil oil." },
      { id: "velo", name: "Black Truffle Velouté", price: 32, desc: "Winter truffle, chestnut, brown butter foam." },
      { id: "burr", name: "Burrata & Tomato",      price: 28, desc: "Heirloom tomato, aged balsamic, garden basil, sea salt." },
      { id: "onion",name: "French Onion",          price: 24, desc: "Slow-caramelised onion, bone broth, Gruyère crust." },
      { id: "tart", name: "Steak Tartare",         price: 34, desc: "Hand-cut prime beef, quail yolk, capers, toasted sourdough." },
    ],
  },
  {
    id: "sea", idx: "III", label: "From the Sea",
    items: [
      { id: "lob",  name: "Butter-Poached Lobster", price: 74, tag: "Signature", desc: "Cold-water lobster, vanilla beurre blanc, leek ash, caviar pearl." },
      { id: "turb", name: "Whole Roasted Turbot",   price: 96, tag: "For Two", desc: "Brown crab, samphire, champagne sauce — carved tableside." },
      { id: "dscal",name: "Pan-Seared Scallops",    price: 46, desc: "Cauliflower, golden raisin, brown butter, capers." },
      { id: "bass", name: "Chilean Sea Bass",       price: 58, desc: "Miso glaze, baby bok choy, ginger dashi." },
      { id: "sole", name: "Dover Sole Meunière",    price: 68, desc: "Classic brown butter, lemon, parsley, almond." },
    ],
  },
  {
    id: "grill", idx: "IV", label: "From the Grill",
    items: [
      { id: "rib",  name: "Dry-Aged Ribeye",     price: 68,  tag: "40-Day", desc: "Prime beef, bone marrow butter, charred shallot, sauce bordelaise." },
      { id: "wagyu",name: "A5 Miyazaki Wagyu",    price: 95,  tag: "4oz", desc: "Japanese wagyu, smoked salt, wasabi, ponzu." },
      { id: "filet",name: "Filet Mignon",         price: 62,  tag: "8oz", desc: "Center-cut tenderloin, pommes purée, sauce béarnaise." },
      { id: "ny",   name: "New York Strip",       price: 58,  tag: "14oz", desc: "Dry-aged, peppercorn crust, confit garlic." },
      { id: "chat", name: "Châteaubriand",        price: 160, tag: "For Two", desc: "Carved tableside, seasonal greens, two sauces." },
      { id: "toma", name: "Tomahawk",             price: 185, tag: "40oz · For Two", desc: "Bone-in ribeye, smoked over oak, finishing salt." },
    ],
  },
  {
    id: "sides", idx: "V", label: "Sides",
    items: [
      { id: "pomme",name: "Truffle Pommes Purée", price: 16, desc: "Whipped potato, black truffle, brown butter." },
      { id: "asp",  name: "Charred Asparagus",    price: 14, desc: "Hollandaise, toasted hazelnut, lemon." },
      { id: "mac",  name: "Lobster Mac & Cheese", price: 22, desc: "Aged cheddar, Gruyère, lobster, herb crumb." },
      { id: "mush", name: "Wild Mushroom Fricassée", price: 16, desc: "Seasonal mushrooms, garlic, thyme, sherry." },
      { id: "spin", name: "Creamed Spinach",      price: 12, desc: "Nutmeg, Parmesan, slow-cooked." },
    ],
  },
  {
    id: "dessert", idx: "VI", label: "Dessert",
    items: [
      { id: "souf", name: "Dark Chocolate Soufflé", price: 22, desc: "Valrhona, salted caramel, crème anglaise — allow 20 minutes." },
      { id: "crepe",name: "Grand Marnier Crêpe",    price: 20, desc: "Flambéed tableside, orange, vanilla bean." },
      { id: "brul", name: "Vanilla Crème Brûlée",   price: 16, desc: "Tahitian vanilla, caramelised sugar crust." },
      { id: "tatin",name: "Tarte Tatin",            price: 18, desc: "Caramelised apple, puff pastry, crème fraîche." },
      { id: "chee", name: "Cheese Selection",       price: 26, desc: "Five artisan cheeses, honeycomb, walnut, fig." },
      { id: "petit",name: "Petit Fours",            price: 16, desc: "A small assortment, with the compliments of the kitchen." },
    ],
  },
  {
    id: "cellar", idx: "VII", label: "Champagne & Cellar",
    items: [
      { id: "champ",name: "Champagne, by the Glass", price: 28, desc: "Grower champagne, brut — ask your sommelier for tonight's pour." },
      { id: "flight",name: "Sommelier's Flight",     price: 85, desc: "Five curated pairings chosen for your table." },
    ],
  },
];

/* Feature items (orderable from the tasting card too) */
window.MENU_FEATURES = [
  { id: "tasting", name: "Seven-Course Tasting", price: 195 },
  { id: "pairing", name: "Wine Pairing",         price: 125 },
];

/* Build a flat id -> {name, price} index for the cart */
window.MENU_INDEX = (function () {
  const idx = {};
  (window.MENU_DATA || []).forEach((sec) =>
    sec.items.forEach((it) => (idx[it.id] = { name: it.name, price: it.price }))
  );
  (window.MENU_FEATURES || []).forEach((it) => (idx[it.id] = { name: it.name, price: it.price }));
  return idx;
})();

/* =========================================================
   Service schedule — drives the date/time dropdowns at
   checkout. Edit hours here; the order form follows.
   openDays: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
   ========================================================= */
window.RESTAURANT = {
  openDays: [3, 4, 5, 6, 0],   // Wed–Sun
  openTime: "18:00",           // first slot
  closeTime: "21:30",          // last slot
  slotMinutes: 30,             // dropdown granularity
  leadMinutes: 25,             // earliest "today" slot = now + this
  daysAhead: 14,               // how far out to offer dates
};
