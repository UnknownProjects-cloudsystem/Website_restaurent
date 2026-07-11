/* =========================================================
   cart.js — ordering engine
   Persists to localStorage so the order survives page
   navigation (home <-> menu) and reloads, like a real site.
   Depends on window.MENU_INDEX (menu-data.js).
   ========================================================= */
window.Cart = (function () {
  const KEY = "maison_cart_v1";
  const TAX_RATE = 0.13;           // HST 13%
  const DELIVERY_FEE = 9;
  let listeners = [];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function write(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    emit();
  }
  function lookup(id) {
    return (window.MENU_INDEX && window.MENU_INDEX[id]) || { name: id, price: 0 };
  }

  function add(id, qty) {
    qty = qty || 1;
    const c = read();
    c[id] = (c[id] || 0) + qty;
    if (c[id] < 1) delete c[id];
    write(c);
  }
  function setQty(id, qty) {
    const c = read();
    if (qty < 1) delete c[id]; else c[id] = qty;
    write(c);
  }
  function remove(id) { const c = read(); delete c[id]; write(c); }
  function clear() { write({}); }

  function items() {
    const c = read();
    return Object.keys(c).map((id) => {
      const info = lookup(id);
      return { id, qty: c[id], name: info.name, price: info.price, line: info.price * c[id] };
    });
  }
  function count() { return Object.values(read()).reduce((a, b) => a + b, 0); }
  function subtotal() { return items().reduce((a, i) => a + i.line, 0); }
  function tax(sub) { return (sub == null ? subtotal() : sub) * TAX_RATE; }
  function totals(mode) {
    const sub = subtotal();
    const delivery = mode === "delivery" ? DELIVERY_FEE : 0;
    const t = tax(sub);
    return { sub: sub, tax: t, delivery: delivery, total: sub + t + delivery, rate: TAX_RATE };
  }

  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach((fn) => { try { fn(); } catch (e) {} }); }

  return { add, setQty, remove, clear, items, count, subtotal, tax, totals, onChange,
           TAX_RATE, DELIVERY_FEE };
})();
