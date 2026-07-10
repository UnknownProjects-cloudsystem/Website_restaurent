/* =========================================================
   main.js — interactions + operational ordering
   Renders menu, runs cart drawer + checkout, plus motion.
   ========================================================= */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = (n) => "$" + (Math.round(n * 100) / 100).toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* =========================================================
     SCHEDULE HELPERS — open-day dates + time slots for the
     checkout dropdowns (driven by window.RESTAURANT)
     ========================================================= */
  const R = window.RESTAURANT || { openDays: [0,1,2,3,4,5,6], openTime: "17:00", closeTime: "22:00", slotMinutes: 30, leadMinutes: 20, daysAhead: 14 };
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const pad2 = (n) => String(n).padStart(2, "0");
  const isoDate = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  const toMin = (hhmm) => { const p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); };
  const fmt12 = (min) => { let h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? "PM" : "AM", hh = h % 12; if (hh === 0) hh = 12; return hh + ":" + pad2(m) + " " + ap; };

  function getSlots(dateValue) {
    const open = toMin(R.openTime), close = toMin(R.closeTime), step = R.slotMinutes;
    const now = new Date(); const isToday = dateValue === isoDate(now);
    let earliest = open;
    if (isToday) { const cur = now.getHours() * 60 + now.getMinutes() + R.leadMinutes; earliest = Math.max(open, Math.ceil(cur / step) * step); }
    const out = [];
    for (let t = earliest; t <= close; t += step) out.push({ value: pad2(Math.floor(t / 60)) + ":" + pad2(t % 60), label: fmt12(t) });
    return out;
  }
  function getOpenDates(count) {
    const out = []; const now = new Date(); let d = new Date(now); let guard = 0;
    while (out.length < count && guard < (R.daysAhead || 14) + 1) {
      if (R.openDays.indexOf(d.getDay()) !== -1) {
        const today = isoDate(d) === isoDate(now);
        if (!today || getSlots(isoDate(d)).length > 0) {
          out.push({ value: isoDate(d), label: today ? "Today · " + DAYS[d.getDay()] : DAYS[d.getDay()] + " · " + MON[d.getMonth()] + " " + d.getDate() });
        }
      }
      d = new Date(d.getTime() + 86400000); guard++;
    }
    return out;
  }
  function timeOptionsHTML(dateValue, selected) {
    const isToday = dateValue === isoDate(new Date());
    let html = "";
    if (isToday) html += `<option value="asap"${selected === "asap" ? " selected" : ""}>As soon as possible</option>`;
    getSlots(dateValue).forEach((o) => { html += `<option value="${o.value}"${o.value === selected ? " selected" : ""}>${o.label}</option>`; });
    if (!html) html = `<option value="">No times available</option>`;
    return html;
  }

  /* =========================================================
     CHROME — inject scroll bar, backdrop, drawer, modal, toasts
     ========================================================= */
  const bar = document.createElement("div"); bar.className = "scroll-progress"; document.body.appendChild(bar);

  const chrome = document.createElement("div");
  chrome.innerHTML = `
    <div class="backdrop" id="backdrop" data-close></div>
    <aside class="drawer" id="drawer" aria-label="Your order">
      <div class="drawer-head"><h3>Your Order</h3><button class="close" data-close aria-label="Close">&times;</button></div>
      <div class="drawer-body" id="drawer-body"></div>
      <div class="drawer-foot" id="drawer-foot"></div>
    </aside>
    <div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="Checkout">
      <div class="modal-card">
        <div class="steps" id="steps"></div>
        <div class="modal-head"><div><span class="eyebrow" id="modal-eyebrow">Checkout</span><h3 id="modal-title">Your Order</h3></div><button class="close" data-modal-close aria-label="Close">&times;</button></div>
        <div class="modal-body" id="modal-body"></div>
      </div>
    </div>
    <div class="modal" id="resv-modal" role="dialog" aria-modal="true" aria-label="Reservation">
      <div class="modal-card">
        <div class="modal-head"><div><span class="eyebrow">Reservations</span><h3 id="resv-title">Book a Table</h3></div><button class="close" data-resv-close aria-label="Close">&times;</button></div>
        <div class="modal-body" id="resv-body"></div>
      </div>
    </div>
    <div class="toast-wrap" id="toast-wrap" aria-live="polite"></div>`;
  document.body.appendChild(chrome);

  const backdrop = $("#backdrop"), drawer = $("#drawer"), modal = $("#modal"), resvModal = $("#resv-modal");

  /* =========================================================
     TOASTS
     ========================================================= */
  function toast(msg) {
    const wrap = $("#toast-wrap");
    const t = document.createElement("div"); t.className = "toast";
    t.innerHTML = `<span class="dot"></span>${esc(msg)}`;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 320); }, 2200);
  }

  /* =========================================================
     RENDER MENU (from MENU_DATA)
     ========================================================= */
  function renderMenu() {
    const root = $("#menu-root"), nav = $("#course-nav");
    if (!window.MENU_DATA) return;

    if (nav) {
      let links = "";
      if ($("#tasting")) links += `<a href="#tasting">Tasting</a>`;
      window.MENU_DATA.forEach((s) => (links += `<a href="#${s.id}">${esc(s.label.replace(/&amp;/g, "&"))}</a>`));
      nav.innerHTML = links;
    }

    if (root) {
      let html = "";
      window.MENU_DATA.forEach((sec) => {
        html += `<div class="course reveal" id="${sec.id}">
          <div class="course-title"><span class="idx">${sec.idx}</span><h2>${esc(sec.label)}</h2><span class="line"></span></div>`;
        sec.items.forEach((it) => {
          html += `<div class="item">
            <div class="item-name">${esc(it.name)}${it.tag ? `<span class="tag">${esc(it.tag)}</span>` : ""}</div>
            <div class="item-price">${money(it.price)}</div>
            <button class="add-btn" data-add="${it.id}" aria-label="Add ${esc(it.name)} to order">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add</button>
            <div class="item-desc">${esc(it.desc)}</div>
          </div>`;
        });
        html += `</div>`;
      });
      root.innerHTML = html;
    }
  }
  renderMenu();

  /* =========================================================
     CART BADGE + DRAWER RENDER
     ========================================================= */
  function renderBadges(bump) {
    const n = Cart.count();
    $$(".cart-count").forEach((el) => {
      el.textContent = n;
      el.classList.toggle("show", n > 0);
      if (bump && n > 0) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
  }

  function renderDrawer() {
    const body = $("#drawer-body"), foot = $("#drawer-foot");
    if (!body) return;
    const items = Cart.items();
    if (!items.length) {
      body.innerHTML = `<div class="cart-empty"><div class="em-mark">✦</div><p style="margin-top:1rem;">Your order is empty.</p><p class="muted" style="margin-top:0.4rem;font-size:0.85rem;">Add something exquisite from the menu.</p></div>`;
      foot.innerHTML = `<a class="btn-solid checkout-btn" href="menu.html">Browse the Menu</a>`;
      return;
    }
    body.innerHTML = items.map((i) => `
      <div class="cart-line">
        <div class="cl-name">${esc(i.name)}</div>
        <div class="cl-price">${money(i.line)}</div>
        <div class="cl-controls" style="grid-column:1 / -1;justify-content:space-between;">
          <div class="stepper">
            <button data-dec="${i.id}" aria-label="Decrease">&minus;</button>
            <span class="qty">${i.qty}</span>
            <button data-inc="${i.id}" aria-label="Increase">+</button>
          </div>
          <button class="cl-remove" data-remove="${i.id}">Remove</button>
        </div>
      </div>`).join("");
    const t = Cart.totals("pickup");
    foot.innerHTML = `
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${money(t.sub)}</span></div>
        <div class="row"><span>HST (13%)</span><span>${money(t.tax)}</span></div>
        <div class="row grand"><span>Total</span><b>${money(t.total)}</b></div>
      </div>
      <button class="btn-solid checkout-btn" data-checkout>Checkout &nbsp;→</button>`;
  }

  Cart.onChange(() => { renderBadges(true); renderDrawer(); });
  renderBadges(false); renderDrawer();

  /* =========================================================
     OPEN / CLOSE drawer + modal
     ========================================================= */
  function openDrawer() { renderDrawer(); drawer.classList.add("open"); backdrop.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeAll() { drawer.classList.remove("open"); modal.classList.remove("open"); resvModal.classList.remove("open"); backdrop.classList.remove("open"); document.body.style.overflow = ""; }
  function openResv() { resv = { step: 1, details: {} }; renderResv(); resvModal.classList.add("open"); backdrop.classList.add("open"); document.body.style.overflow = "hidden"; }
  backdrop.addEventListener("click", closeAll);
  $$("[data-close]").forEach((b) => b.addEventListener("click", closeAll));
  $("[data-modal-close]").addEventListener("click", closeAll);
  $("[data-resv-close]").addEventListener("click", closeAll);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  /* =========================================================
     FLY-TO-CART
     ========================================================= */
  function flyToCart(fromEl) {
    const target = $(".cart-btn");
    if (!target || reduce || !fromEl) return;
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const chip = document.createElement("div"); chip.className = "fly-chip";
    chip.style.left = a.left + a.width / 2 - 8 + "px";
    chip.style.top = a.top + a.height / 2 - 8 + "px";
    document.body.appendChild(chip);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    chip.animate(
      [{ transform: "translate(0,0) scale(1)", opacity: 1 },
       { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 60}px) scale(1.3)`, opacity: 1, offset: 0.5 },
       { transform: `translate(${dx}px,${dy}px) scale(0.2)`, opacity: 0.4 }],
      { duration: 720, easing: "cubic-bezier(0.5,0,0.7,1)" }
    ).onfinish = () => chip.remove();
  }

  /* =========================================================
     DELEGATED CLICKS — add / qty / remove / open / checkout
     ========================================================= */
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const id = add.getAttribute("data-add");
      Cart.add(id, 1);
      flyToCart(add);
      const info = (window.MENU_INDEX && window.MENU_INDEX[id]) || { name: "Item" };
      toast(`${info.name} added`);
      add.classList.add("added");
      const label = add.querySelector("svg") ? add : null;
      setTimeout(() => add.classList.remove("added"), 900);
      return;
    }
    const inc = e.target.closest("[data-inc]"); if (inc) { const id = inc.getAttribute("data-inc"); Cart.add(id, 1); return; }
    const dec = e.target.closest("[data-dec]"); if (dec) { const id = dec.getAttribute("data-dec"); Cart.add(id, -1); return; }
    const rm = e.target.closest("[data-remove]"); if (rm) { Cart.remove(rm.getAttribute("data-remove")); return; }
    if (e.target.closest("[data-drawer-open]")) { e.preventDefault(); openDrawer(); return; }
    if (e.target.closest("[data-checkout]")) { startCheckout(); return; }
    if (e.target.closest("[data-resv-open]")) { e.preventDefault(); openResv(); return; }
  });

  /* =========================================================
     CHECKOUT FLOW (4 steps)
     ========================================================= */
  let checkout = { step: 1, mode: "pickup", details: {} };

  function startCheckout() {
    if (!Cart.items().length) { toast("Your order is empty"); return; }
    checkout = { step: 1, mode: "pickup", details: {}, tipType: "none", tipAmount: 0 };
    drawer.classList.remove("open");
    modal.classList.add("open"); backdrop.classList.add("open"); document.body.style.overflow = "hidden";
    renderStep();
  }

  function setSteps(active) {
    $("#steps").innerHTML = [1, 2, 3, 4].map((i) => `<div class="dot ${i <= active ? "active" : ""}"></div>`).join("");
  }

  function renderStep() {
    const body = $("#modal-body"), title = $("#modal-title"), eyebrow = $("#modal-eyebrow");
    setSteps(checkout.step);

    if (checkout.step === 1) {
      eyebrow.textContent = "Step 1 of 4"; title.textContent = "Review Your Order";
      const items = Cart.items(); const t = Cart.totals(checkout.mode);
      body.innerHTML = `
        <div class="review-list">
          ${items.map((i) => `<div class="r"><span><span class="q">${i.qty}×</span> ${esc(i.name)}</span><span>${money(i.line)}</span></div>`).join("")}
        </div>
        <div class="totals">
          <div class="row"><span>Subtotal</span><span>${money(t.sub)}</span></div>
          <div class="row"><span>HST (13%)</span><span>${money(t.tax)}</span></div>
          <div class="row grand"><span>Total</span><b>${money(t.total)}</b></div>
        </div>
        <div class="modal-actions">
          <button class="btn-back" data-step-prev>Keep Browsing</button>
          <button class="btn-solid" data-step-next>Continue →</button>
        </div>`;
    }

    else if (checkout.step === 2) {
      eyebrow.textContent = "Step 2 of 4"; title.textContent = "Your Details";
      const d = checkout.details;
      const openDaysLabel = (R.openDays || []).map((x) => DAYS[x]).join(", ");
      const dates = getOpenDates(8);
      const selDate = (d.date && dates.some((x) => x.value === d.date)) ? d.date : (dates[0] ? dates[0].value : "");
      const firstSlot = getSlots(selDate)[0];
      const selTime = d.time || (selDate === isoDate(new Date()) ? "asap" : (firstSlot ? firstSlot.value : ""));
      const dateOpts = dates.length ? dates.map((o) => `<option value="${o.value}"${o.value === selDate ? " selected" : ""}>${o.label}</option>`).join("") : `<option value="">No dates available</option>`;
      const timeOpts = timeOptionsHTML(selDate, selTime);
      body.innerHTML = `
        <div class="form-grid">
          <div class="field full">
            <div class="seg">
              <label><input type="radio" name="mode" value="pickup" ${checkout.mode === "pickup" ? "checked" : ""}><span>Pickup</span></label>
              <label><input type="radio" name="mode" value="delivery" ${checkout.mode === "delivery" ? "checked" : ""}><span>Delivery (+${money(Cart.DELIVERY_FEE)})</span></label>
            </div>
          </div>
          <div class="field"><label>First Name</label><input id="f-first" value="${esc(d.first || "")}" autocomplete="given-name"><div class="err"></div></div>
          <div class="field"><label>Last Name</label><input id="f-last" value="${esc(d.last || "")}" autocomplete="family-name"><div class="err"></div></div>
          <div class="field full"><label>Email</label><input id="f-email" type="email" value="${esc(d.email || "")}" autocomplete="email"><div class="err"></div></div>
          <div class="field full"><label>Phone <span class="muted">(optional)</span></label><input id="f-phone" type="tel" value="${esc(d.phone || "")}" autocomplete="tel" placeholder="Not required"><div class="err"></div></div>
          <div class="field full" id="addr-wrap" style="${checkout.mode === "delivery" ? "" : "display:none"}"><label>Delivery Address</label><input id="f-addr" value="${esc(d.addr || "")}" autocomplete="street-address"><div class="err"></div></div>
          <div class="field"><label id="lbl-day">${checkout.mode === "delivery" ? "Delivery Day" : "Pickup Day"}</label><select id="f-date">${dateOpts}</select><div class="err"></div></div>
          <div class="field"><label>Time</label><select id="f-time">${timeOpts}</select><div class="err"></div></div>
          <div class="field full"><label>Notes for the Kitchen <span class="muted">(optional)</span></label><textarea id="f-notes" rows="2">${esc(d.notes || "")}</textarea></div>
        </div>
        <p class="muted" style="font-size:0.78rem;margin-top:0.9rem;">Open ${openDaysLabel} · ${fmt12(toMin(R.openTime))}–${fmt12(toMin(R.closeTime))}. No account or phone number required.</p>
        <div class="modal-actions">
          <button class="btn-back" data-step-prev>← Back</button>
          <button class="btn-solid" data-step-next>Continue →</button>
        </div>`;
      $$('input[name="mode"]').forEach((r) => r.addEventListener("change", (e) => {
        checkout.mode = e.target.value;
        $("#addr-wrap").style.display = checkout.mode === "delivery" ? "" : "none";
        const lbl = $("#lbl-day"); if (lbl) lbl.textContent = checkout.mode === "delivery" ? "Delivery Day" : "Pickup Day";
      }));
      const dateSel = $("#f-date");
      if (dateSel) dateSel.addEventListener("change", () => { const tsel = $("#f-time"); if (tsel) tsel.innerHTML = timeOptionsHTML(dateSel.value, null); });
    }

    else if (checkout.step === 3) {
      eyebrow.textContent = "Step 3 of 4"; title.textContent = "Payment";
      if (checkout.tipType == null) { checkout.tipType = "none"; checkout.tipAmount = 0; }
      body.innerHTML = `
        <div class="pay-note"><b>Demo checkout.</b> No card is collected and no charge is made. Connect Stripe, Square, or your POS here to take live payment.</div>
        <div class="form-grid">
          <div class="field full">
            <div class="seg">
              <label><input type="radio" name="pay" value="pickup" checked><span>Pay at ${checkout.mode === "delivery" ? "Door" : "Pickup"}</span></label>
              <label><input type="radio" name="pay" value="card"><span>Card (integration)</span></label>
            </div>
          </div>
          <div class="field full">
            <label>Add a Tip</label>
            <div class="seg tip-seg">
              <label><input type="radio" name="tip" value="none" ${checkout.tipType === "none" ? "checked" : ""}><span>None</span></label>
              <label><input type="radio" name="tip" value="10" ${checkout.tipType === "10" ? "checked" : ""}><span>10%</span></label>
              <label><input type="radio" name="tip" value="15" ${checkout.tipType === "15" ? "checked" : ""}><span>15%</span></label>
              <label><input type="radio" name="tip" value="20" ${checkout.tipType === "20" ? "checked" : ""}><span>20%</span></label>
              <label><input type="radio" name="tip" value="custom" ${checkout.tipType === "custom" ? "checked" : ""}><span>Custom</span></label>
            </div>
          </div>
          <div class="field full" id="tip-custom-wrap" style="${checkout.tipType === "custom" ? "" : "display:none"}">
            <label>Custom Tip ($)</label><input id="tip-custom" type="number" min="0" step="1" value="${checkout.tipType === "custom" && checkout.tipAmount ? checkout.tipAmount : ""}" placeholder="0.00">
          </div>
        </div>
        <div class="totals" style="margin-top:1rem;" id="pay-totals"></div>
        <div class="modal-actions">
          <button class="btn-back" data-step-prev>← Back</button>
          <button class="btn-solid" data-place-order>Place Order &nbsp;✦</button>
        </div>`;

      function calcTip(sub) {
        if (checkout.tipType === "custom") { const v = parseFloat($("#tip-custom") && $("#tip-custom").value); return isNaN(v) || v < 0 ? 0 : Math.round(v * 100) / 100; }
        const pct = { "10": 0.10, "15": 0.15, "20": 0.20 }[checkout.tipType] || 0;
        return Math.round(sub * pct * 100) / 100;
      }
      function renderPayTotals() {
        const t = Cart.totals(checkout.mode);
        checkout.tipAmount = calcTip(t.sub);
        const grand = t.total + checkout.tipAmount;
        $("#pay-totals").innerHTML = `
          <div class="row"><span>Subtotal</span><span>${money(t.sub)}</span></div>
          ${t.delivery ? `<div class="row"><span>Delivery</span><span>${money(t.delivery)}</span></div>` : ""}
          <div class="row"><span>HST (13%)</span><span>${money(t.tax)}</span></div>
          ${checkout.tipAmount ? `<div class="row"><span>Tip</span><span>${money(checkout.tipAmount)}</span></div>` : ""}
          <div class="row grand"><span>Total Due</span><b>${money(grand)}</b></div>`;
      }
      renderPayTotals();
      $$('input[name="tip"]').forEach((r) => r.addEventListener("change", (e) => {
        checkout.tipType = e.target.value;
        $("#tip-custom-wrap").style.display = checkout.tipType === "custom" ? "" : "none";
        renderPayTotals();
      }));
      const custom = $("#tip-custom");
      if (custom) custom.addEventListener("input", renderPayTotals);
    }

    else if (checkout.step === 4) {
      eyebrow.textContent = "Confirmed"; title.textContent = "";
      const no = checkout.orderNo;
      const d = checkout.details;
      const sched = (d.time === "asap")
        ? "estimated " + (checkout.mode === "delivery" ? "45–60 minutes" : "25–35 minutes")
        : (esc(d.dateLabel || d.date || "") + (d.timeLabel ? " · " + esc(d.timeLabel) : ""));
      const t = checkout.placed || Cart.totals(checkout.mode);
      const tip = checkout.tipAmount || 0;
      const grand = t.total + tip;
      const lines = (checkout.placedItems || []).map((i) => `<div class="r"><span><span class="q">${i.qty}×</span> ${esc(i.name)}</span><span>${money(i.line)}</span></div>`).join("");
      body.innerHTML = `
        <div class="confirm">
          <div class="seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></div>
          <h3>Order Confirmed</h3>
          <p class="lead">Thank you, ${esc(d.first || "guest")}. The kitchen has your order.</p>
          <p class="order-no">${esc(no)}</p>
          <p class="muted">${checkout.mode === "delivery" ? "Delivery" : "Pickup"} · ${sched}</p>
        </div>
        <div class="review-list" style="margin-top:1.5rem;">${lines}</div>
        <div class="totals">
          <div class="row"><span>Subtotal</span><span>${money(t.sub)}</span></div>
          ${t.delivery ? `<div class="row"><span>Delivery</span><span>${money(t.delivery)}</span></div>` : ""}
          <div class="row"><span>HST (13%)</span><span>${money(t.tax)}</span></div>
          ${tip ? `<div class="row"><span>Tip</span><span>${money(tip)}</span></div>` : ""}
          <div class="row grand"><span>Total</span><b>${money(grand)}</b></div>
        </div>
        ${d.notes ? `<div class="pay-note" style="margin-top:1rem;"><b>Notes for the kitchen:</b> ${esc(d.notes)}</div>` : ""}
        <p class="muted center" style="font-size:0.8rem;margin-top:1rem;">A confirmation would be sent to ${esc(d.email || "your email")}.</p>
        <div class="modal-actions" style="justify-content:center;margin-top:1.4rem;">
          <button class="btn-solid" data-done>Done</button>
        </div>`;
    }
  }

  function validateDetails() {
    const get = (id) => $(id) ? $(id).value.trim() : "";
    const d = {
      first: get("#f-first"), last: get("#f-last"), email: get("#f-email"),
      phone: get("#f-phone"), addr: get("#f-addr"), date: get("#f-date"),
      time: get("#f-time"), notes: get("#f-notes"),
    };
    let ok = true;
    const fail = (sel, msg) => {
      const f = $(sel) && $(sel).closest(".field");
      if (f) { f.classList.add("invalid"); const err = $(".err", f); if (err) err.textContent = msg; }
      ok = false;
    };
    $$(".field").forEach((f) => { f.classList.remove("invalid"); const e = $(".err", f); if (e) e.textContent = ""; });
    if (!d.first) fail("#f-first", "Required");
    if (!d.last) fail("#f-last", "Required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) fail("#f-email", "Enter a valid email");
    if (d.phone && d.phone.replace(/\D/g, "").length < 7) fail("#f-phone", "Enter a valid phone or leave blank");
    if (checkout.mode === "delivery" && !d.addr) fail("#f-addr", "Required for delivery");
    if (!d.date) fail("#f-date", "Pick a day");
    if (!d.time) fail("#f-time", "Pick a time");
    const dsel = $("#f-date"), tsel = $("#f-time");
    d.dateLabel = dsel && dsel.options[dsel.selectedIndex] ? dsel.options[dsel.selectedIndex].text : "";
    d.timeLabel = tsel && tsel.options[tsel.selectedIndex] ? tsel.options[tsel.selectedIndex].text : "";
    checkout.details = d;
    return ok;
  }

  function genOrderNo() {
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "ML-" + r + "-" + String(new Date().getFullYear()).slice(2);
  }

  // step navigation (delegated within modal)
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-step-next]")) {
      if (checkout.step === 2 && !validateDetails()) { toast("Please complete the highlighted fields"); return; }
      checkout.step++; renderStep(); $(".modal-card").scrollTop = 0; return;
    }
    if (e.target.closest("[data-step-prev]")) {
      if (checkout.step === 1) { closeAll(); return; }
      checkout.step--; renderStep(); return;
    }
    if (e.target.closest("[data-place-order]")) {
      checkout.orderNo = genOrderNo();
      checkout.placedItems = Cart.items();
      checkout.placed = Cart.totals(checkout.mode);
      checkout.step = 4; renderStep();
      Cart.clear(); toast("Order placed ✦"); return;
    }
    if (e.target.closest("[data-done]")) { closeAll(); return; }
  });

  /* =========================================================
     RESERVATIONS (booking form)
     ========================================================= */
  let resv = { step: 1, details: {} };

  function partyOptions(sel) {
    let html = "";
    for (let i = 1; i <= 8; i++) html += `<option value="${i}"${String(i) === String(sel) ? " selected" : ""}>${i} ${i === 1 ? "guest" : "guests"}</option>`;
    html += `<option value="9+"${sel === "9+" ? " selected" : ""}>9+ (large party)</option>`;
    return html;
  }
  function resvTimeOptions(dateValue, selected) {
    const slots = getSlots(dateValue);
    if (!slots.length) return `<option value="">No times available</option>`;
    return slots.map((o) => `<option value="${o.value}"${o.value === selected ? " selected" : ""}>${o.label}</option>`).join("");
  }

  function renderResv() {
    const body = $("#resv-body"), title = $("#resv-title");
    if (resv.step === 1) {
      title.textContent = "Book a Table";
      const d = resv.details;
      const openDaysLabel = (R.openDays || []).map((x) => DAYS[x]).join(", ");
      const dates = getOpenDates(8);
      const selDate = (d.date && dates.some((x) => x.value === d.date)) ? d.date : (dates[0] ? dates[0].value : "");
      const firstSlot = getSlots(selDate)[0];
      const selTime = d.time || (firstSlot ? firstSlot.value : "");
      const dateOpts = dates.length ? dates.map((o) => `<option value="${o.value}"${o.value === selDate ? " selected" : ""}>${o.label}</option>`).join("") : `<option value="">No dates available</option>`;
      body.innerHTML = `
        <div class="form-grid">
          <div class="field"><label>Party Size</label><select id="r-party">${partyOptions(d.party || "2")}</select></div>
          <div class="field"><label>Day</label><select id="r-date">${dateOpts}</select></div>
          <div class="field full"><label>Time</label><select id="r-time">${resvTimeOptions(selDate, selTime)}</select></div>
          <div class="field"><label>First Name</label><input id="r-first" value="${esc(d.first || "")}" autocomplete="given-name"><div class="err"></div></div>
          <div class="field"><label>Last Name</label><input id="r-last" value="${esc(d.last || "")}" autocomplete="family-name"><div class="err"></div></div>
          <div class="field full"><label>Email</label><input id="r-email" type="email" value="${esc(d.email || "")}" autocomplete="email"><div class="err"></div></div>
          <div class="field full"><label>Phone <span class="muted">(optional)</span></label><input id="r-phone" type="tel" value="${esc(d.phone || "")}" placeholder="Not required"><div class="err"></div></div>
          <div class="field full"><label>Special Requests <span class="muted">(optional)</span></label><textarea id="r-notes" rows="2" placeholder="Allergies, occasion, seating preference…">${esc(d.notes || "")}</textarea></div>
        </div>
        <p class="muted" style="font-size:0.78rem;margin-top:0.9rem;">Open ${openDaysLabel} · ${fmt12(toMin(R.openTime))}–${fmt12(toMin(R.closeTime))}. Parties of 9 or more, please call us. No phone number required.</p>
        <div class="modal-actions">
          <button class="btn-back" data-resv-cancel>Cancel</button>
          <button class="btn-solid" data-resv-confirm>Confirm Booking →</button>
        </div>`;
      const ds = $("#r-date");
      if (ds) ds.addEventListener("change", () => { const ts = $("#r-time"); if (ts) ts.innerHTML = resvTimeOptions(ds.value, null); });
    } else {
      title.textContent = "";
      const d = resv.details;
      body.innerHTML = `
        <div class="confirm">
          <div class="seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></div>
          <h3>Table Reserved</h3>
          <p class="lead">See you soon, ${esc(d.first || "guest")}.</p>
          <p class="order-no">${esc(resv.resvNo)}</p>
          <p class="muted">${esc(d.partyLabel || "")} · ${esc(d.dateLabel || "")}${d.timeLabel ? " · " + esc(d.timeLabel) : ""}</p>
          ${d.notes ? `<div class="pay-note" style="margin-top:1rem;text-align:left;"><b>Your note:</b> ${esc(d.notes)}</div>` : ""}
          <p class="muted center" style="font-size:0.8rem;margin-top:1rem;">A confirmation would be sent to ${esc(d.email || "your email")}.</p>
          <div class="modal-actions" style="justify-content:center;margin-top:1.4rem;">
            <button class="btn-solid" data-resv-done>Done</button>
          </div>
        </div>`;
    }
  }

  function validateResv() {
    const get = (id) => $(id) ? $(id).value.trim() : "";
    const d = {
      party: get("#r-party"), first: get("#r-first"), last: get("#r-last"),
      email: get("#r-email"), phone: get("#r-phone"), date: get("#r-date"),
      time: get("#r-time"), notes: get("#r-notes"),
    };
    let ok = true;
    const fail = (sel, msg) => { const f = $(sel) && $(sel).closest(".field"); if (f) { f.classList.add("invalid"); const e = $(".err", f); if (e) e.textContent = msg; } ok = false; };
    $$("#resv-body .field").forEach((f) => { f.classList.remove("invalid"); const e = $(".err", f); if (e) e.textContent = ""; });
    if (!d.first) fail("#r-first", "Required");
    if (!d.last) fail("#r-last", "Required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) fail("#r-email", "Enter a valid email");
    if (d.phone && d.phone.replace(/\D/g, "").length < 7) fail("#r-phone", "Enter a valid phone or leave blank");
    if (!d.date) fail("#r-date", "Pick a day");
    if (!d.time) fail("#r-time", "Pick a time");
    const lbl = (sel) => { const s = $(sel); return s && s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ""; };
    d.partyLabel = lbl("#r-party"); d.dateLabel = lbl("#r-date"); d.timeLabel = lbl("#r-time");
    resv.details = d;
    return ok;
  }

  function genResvNo() {
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "MR-" + r + "-" + String(new Date().getFullYear()).slice(2);
  }

  resvModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-resv-confirm]")) {
      if (!validateResv()) { toast("Please complete the highlighted fields"); return; }
      resv.resvNo = genResvNo(); resv.step = 2; renderResv();
      const card = $("#resv-modal .modal-card"); if (card) card.scrollTop = 0;
      toast("Table reserved ✦"); return;
    }
    if (e.target.closest("[data-resv-cancel]") || e.target.closest("[data-resv-done]")) { closeAll(); return; }
  });

  /* =========================================================
     MOTION — scroll progress, reveals, hero split, magnetic, tilt, nav
     ========================================================= */
  // scroll progress + nav state
  const navEl = $(".nav");
  function onScroll() {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (p * 100) + "%";
    if (navEl) navEl.classList.toggle("scrolled", window.scrollY > 40);
  }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  // mobile menu
  const toggle = $(".nav-toggle"), links = $(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => { const o = links.classList.toggle("open"); toggle.setAttribute("aria-expanded", o); });
    $$("a", links).forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
  }

  // hero letter split
  const title = $(".hero-title[data-split]");
  if (title && !reduce) {
    const text = title.textContent.trim(); title.textContent = "";
    [...text].forEach((c, i) => {
      const s = document.createElement("span"); s.className = "ch"; s.textContent = c === " " ? "\u00A0" : c;
      s.style.animationDelay = 0.25 + i * 0.045 + "s"; title.appendChild(s);
    });
  }

  // reveal observer (re-query after menu render)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal, .rule").forEach((el) => io.observe(el));

  // magnetic buttons
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
    // dish tilt
    $$(".dish").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  // course-nav scrollspy
  const cLinks = $$(".course-nav a");
  if (cLinks.length) {
    const secs = cLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { const id = "#" + en.target.id; cLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id)); } });
    }, { threshold: 0.2, rootMargin: "-20% 0px -65% 0px" });
    secs.forEach((s) => spy.observe(s));
  }

  // active top-nav link
  const path = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a[data-page]").forEach((a) => { if (a.dataset.page === path) a.classList.add("active"); });
})();
