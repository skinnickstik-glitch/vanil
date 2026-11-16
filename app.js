const CFG = window.APP_CONFIG;
const Store = window.Store;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rub = n => Math.round(n).toLocaleString("ru-RU") + "\u00a0" + CFG.currency;
const lc = t => t ? t[0].toLowerCase() + t.slice(1) : t;
const STATUS = { new: "Новая", confirmed: "Подтверждена", onway: "В работе", done: "Выполнена", canceled: "Отменена" };
const T = CFG.text || {};
// ключи хранилища с префиксом приложения: несколько демо могут жить на одном домене
const NS = (CFG.dbName || "app") + ":";
const STATUS_ORDER = ["new", "confirmed", "onway", "done"];

// ---------- линейные иконки (вместо эмодзи и 3D) ----------
const ICONS = {
  well: "M7 21 12 3l5 18M8.7 15h6.6M10.3 9h3.4M3 21h18",
  caisson: "M6 10h12v11H6zM9 10V7a3 3 0 0 1 6 0v3M3 21h18M12 14v4",
  filter: "M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3zM9 14.5a3 3 0 0 0 3 3",
  septic: "M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 9V6h3v3M2 13h2M20 13h2M4 14h16",
  service: "M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.3-.4-.4-2.3z",
  pump: "M3 8h7v8H3M10 10h4a3 3 0 0 1 3 3v8M21 21h-8M14 10V6M12 6h4",
  phone: "M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  check: "M5 12.5 10 17 19 7",
  doc: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
  passport: "M6 3h12v18H6zM9 17h6M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  shield: "M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6zM9 12l2.2 2.2L15.5 10",
  ruler: "M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  camera: "M4 7h3l2-2.5h6L17 7h3v12H4zM12 9.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  x: "M6 6l12 12M18 6 6 18",
  logout: "M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10",
  arrow: "M5 12h14M13 6l6 6-6 6",
  msg: "M4 5h16v11H9l-5 4z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  inbox: "M4 13l2.5-8h11l2.5 8v6H4zM4 13h5l1 2h4l1-2h5",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  plus: "M12 5v14M5 12h14",
  fence: "M5 20V7l2-3 2 3v13M15 20V7l2-3 2 3v13M3 10h18M3 16h18",
  gate: "M3 20V5h2v15M19 20V5h2v15M5 8h14v10H5zM12 8v10M7.5 13h1M15.5 13h1",
  bath: "M3 11 12 4l9 7M5 9.5V20h14V9.5M9 20v-5h6v5M16 6V3h2v4.5",
  canopy: "M3 9 12 5l9 4M5 9v11M19 9v11M7 16h10l-1-3H8zM8.5 18.5h.5M15 18.5h.5",
  terrace: "M3 14h18M5 14v6M19 14v6M3 17h18M6 14V8M18 14V8M4 8h16",
  cake: "M4 20h16M5 20v-6h14v6M7 14v-4h10v4M12 10V7M12 4.5v.5M5 17c2 1 3-1 4.7 0s3 1 4.6 0 3-1 4.7 0",
  tiers: "M4 21h16M5 21v-5h14v5M7.5 16v-4h9v4M9.5 12V8.5h5V12M12 8.5V6",
  cupcake: "M6 12h12l-1.5 8h-9zM6 12a6 4.5 0 0 1 12 0M12 7.5V5M9.5 16v4M14.5 16v4",
  flower: "M12 9a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 9V4.5M12 14v6M9.6 11.5H5M14.4 11.5H19M8.5 7.5c0-2 1.6-3 3.5-3s3.5 1 3.5 3M9 20h6",
  truck: "M2 6h12v10H2zM14 9h4l3 3.5V16h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  box: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9M7.5 5.2l9 4.6",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.4c2.1.8 3.5 2.8 3.5 5.6",
  sofa: "M5 11V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5V11M3 11h4v4h10v-4h4v6H3zM5 17v2M19 17v2",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7",
  building: "M4 21V4h10v17M14 9h6v12M2 21h20M7 8h1M10 8h1M7 12h1M10 12h1M7 16h1M10 16h1M17 13h1M17 17h1",
  elevator: "M5 3h14v18H5zM12 3v18M8 9l1.5-2L11 9M13 15l1.5 2 1.5-2",
};
const ic = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n] || ICONS.doc}"/></svg>`;

// ---------- настройки (прайс и бренд можно переопределить из кабинета) ----------
let S = null;
function defaults() {
  return { brand: { ...CFG.brand }, minOrder: CFG.minOrder, travelFee: CFG.travelFee,
    zones: JSON.parse(JSON.stringify(CFG.zones || [])), items: JSON.parse(JSON.stringify(CFG.items)), fabrics: JSON.parse(JSON.stringify(CFG.fabrics)), extras: JSON.parse(JSON.stringify(CFG.extras)) };
}
async function loadSettings() {
  const saved = await Store.getSettings().catch(() => null);
  S = saved ? { ...defaults(), ...saved, brand: { ...CFG.brand, ...(saved.brand || {}) } } : defaults();
  applyBrand();
}
function applyBrand() {
  const r = document.documentElement.style, c = CFG.colors;
  for (const [k, v] of Object.entries(c)) r.setProperty("--" + k, v);
  document.title = `${S.brand.name} — ${S.brand.tagline}`;
}
const itemById = id => S.items.find(i => i.id === id);

// ---------- расчёт цены ----------
function linePrice(l) {
  const it = itemById(l.itemId); if (!it) return 0;
  const v = it.variants ? (it.variants.find(v => v.id === l.variantId) || it.variants[0]) : null;
  let base = it.perArea ? Math.max(it.minArea || 0, +l.area || 0) * it.pricePerM2 : it.perUnit ? v.price * Math.max(v.min || 1, +l.amount || v.def || 1) : v.price;
  if (it.sides && l.sides === 2) base *= 1.8;
  const f = S.fabrics.find(f => f.id === l.fabric); if (f) base *= f.k;
  let add = 0;
  for (const eid of l.extras || []) { const e = S.extras.find(x => x.id === eid); if (!e) continue; if (e.type === "percent") base *= 1 + e.value / 100; else add += e.value; }
  return (base + add) * (it.perArea || it.perUnit ? 1 : (l.qty || 1));
}
const zoneOf = id => (S.zones || []).find(z => z.id === id) || (S.zones || [])[0];
function total(cart, zoneId = draft.form.zone) {
  const z = zoneOf(zoneId);
  const sum = cart.reduce((a, l) => a + linePrice(l), 0) + (cart.length ? (S.travelFee || 0) + (z?.fee || 0) : 0);
  return { sum, final: cart.length ? Math.max(sum, S.minOrder) : 0, belowMin: cart.length && sum < S.minOrder };
}
function lineTitle(l) {
  const it = itemById(l.itemId); if (!it) return "?";
  const parts = [it.title];
  if (it.perArea) parts.push(`${l.area} м²`); else { const v = it.variants.find(v => v.id === l.variantId) || it.variants[0]; if (v && it.variants.length > 1) parts.push(lc(v.title.replace(/\s*\([^)]*м\)$/, ""))); if (it.perUnit) parts.push(`${Math.max(v.min || 1, +l.amount || v.def).toLocaleString("ru-RU")} ${it.perUnit.unit}`); }
  if (it.sides && l.sides === 2) parts.push("2 стороны");
  const f = S.fabrics.find(f => f.id === l.fabric); if (f && f.k !== 1) parts.push(lc(f.title));
  const ex = (l.extras || []).map(id => lc(S.extras.find(e => e.id === id)?.title)).filter(Boolean);
  let s = parts.join(", "); if (ex.length) s += " + " + ex.join(", ");
  if (!it.perArea && !it.perUnit && l.qty > 1) s += ` × ${l.qty}`;
  return s;
}
const fromPrice = it => it.perArea ? `${rub(it.pricePerM2)} / м²` : "от " + rub(Math.min(...it.variants.map(v => v.price))) + (it.perUnit ? "/" + it.perUnit.unit : "");
const money = n => n ? rub(n) : "после осмотра";

// ---------- общий каркас ----------
const telHref = () => "tel:" + esc(S.brand.phone.replace(/[^+\d]/g, ""));
function header(extra = "", nav = false) {
  const logo = S.brand.logoUrl ? `<img src="${esc(S.brand.logoUrl)}" alt="">` : `<span>${esc(S.brand.logoText)}</span>`;
  return `<header class="top"><div class="wrap top-in">
    <a class="brand" href="#/"><div class="logo">${logo}</div><div><b>${esc(S.brand.name)}</b><small>${esc(S.brand.tagline)} · ${esc(S.brand.city)}</small></div></a>
    ${nav ? `<nav class="nav"><button data-go="calc">Расчёт стоимости</button><button data-go="how">${esc(T.navHow || "Этапы работ")}</button><button data-go="docs">${esc(T.navDocs || "Документы и гарантия")}</button></nav>` : ""}
    <div class="top-r">${extra}</div></div></header>`;
}
const callBtn = () => `<div class="tel-box"><small>${esc(S.brand.workHours)}</small><a class="tel" href="${telHref()}">${esc(S.brand.phone)}</a></div><a class="call" href="${telHref()}" aria-label="Позвонить">${ic("phone")}</a>`;
const goTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
function bindGo() { $$("[data-go]").forEach(b => b.onclick = () => goTo(b.dataset.go)); }
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.classList.add("show")); setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2200); }

// ================================ КЛИЕНТ ================================
const draft = JSON.parse(localStorage.getItem(NS + "draft") || "null") || { cart: [], photos: [], form: {} };
draft.cart = (draft.cart || []).filter(l => CFG.items.some(i => i.id === l.itemId));
const saveDraft = () => { try { localStorage.setItem(NS + "draft", JSON.stringify({ ...draft, photos: [] })); } catch {} };

function days() {
  const out = [], d = new Date(); d.setHours(12);
  for (let i = CFG.daysFrom || 0; i < (CFG.daysFrom || 0) + CFG.daysAhead; i++) { const x = new Date(d); x.setDate(d.getDate() + i);
    out.push({ v: x.toISOString().slice(0, 10), t: (i === 0 ? "Сегодня, " : i === 1 ? "Завтра, " : "") + x.toLocaleDateString("ru-RU", { weekday: i > 1 ? "short" : undefined, day: "numeric", month: "long" }) }); }
  return out;
}

function renderClient() {
  const app = $("#app");
  const step = (n, title, sub = "", id = "") => `<div class="sec-h"${id ? ` id="${id}"` : ""}><span class="num">${String(n).padStart(2, "0")}</span><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div></div>`;
  app.innerHTML = `${header(callBtn(), true)}
  <main class="client">
    <section class="hero"><div class="wrap hero-in">
      <div class="hero-txt">
        ${T.eyebrow ? `<p class="eyebrow">${esc(T.eyebrow)}</p>` : ""}
        <h1>${T.heroTitle}</h1>
        <p class="lead">${esc(T.heroText)}</p>
        <div class="cta"><button class="btn" data-go="calc">Рассчитать стоимость ${ic("arrow")}</button><button class="btn ghost" data-go="form-h">${esc(T.ctaVisit)}</button></div>
        <ul class="facts">${(T.facts || []).map(c => `<li>${ic("check")}${esc(c)}</li>`).join("")}</ul>
      </div>
      <figure class="hero-img"><img src="img/hero.webp" alt="${esc(T.heroAlt || "")}" width="1600" height="1201" fetchpriority="high"><figcaption>Иллюстративное фото</figcaption></figure>
    </div></section>

    <section class="calc wrap" id="calc">
      <div class="calc-main">
        ${step(1, T.stepWhat, "Выберите одну или несколько услуг — смета пересчитывается сразу.")}
        <div class="grid">${S.items.map(it => `
          <button class="item" data-id="${it.id}">
            <span class="ic-box">${ic(it.model)}</span>
            <span class="it-t"><b>${esc(it.title)}</b><small>${fromPrice(it)}</small></span>
            <em class="qty" hidden></em><span class="go">${ic("plus")}</span>
          </button>`).join("")}</div>
        ${step(2, T.photoTitle, T.photoSub)}
        <label class="photos-drop"><input id="photo" type="file" accept="image/*" multiple><span class="pd-ic">${ic("camera")}</span><span class="pd-t"><b>Добавить фото</b><small>${esc(T.photoHint)}</small></span></label>
        <div id="thumbs" class="thumbs"></div>
        ${step(3, T.whenTitle, T.whenSub, "form-h")}
        <div class="form">
          <label>Имя<input id="f-name" autocomplete="name" placeholder="Как к вам обращаться"></label>
          <label>Телефон<input id="f-phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__"></label>
          <label class="wide">${esc(T.addrLabel)}<input id="f-addr" autocomplete="street-address" placeholder="${esc(T.addrPlaceholder)}"></label>
          <label>${esc(T.floorLabel)}<input id="f-floor" placeholder="${esc(T.floorPlaceholder)}"></label>
          ${T.extraLabel ? `<label class="wide">${esc(T.extraLabel)}<input id="f-extra" placeholder="${esc(T.extraPlaceholder || "")}"></label>` : ""}
          ${S.zones?.length ? `<label>${esc(T.zoneLabel || "Удалённость участка")}<select id="f-zone">${S.zones.map(z => `<option value="${z.id}">${esc(z.title)}${z.fee ? " · +" + rub(z.fee) : ""}</option>`).join("")}</select></label>` : ""}
          ${T.visitLabel ? `<label class="check wide"><input id="f-visit" type="checkbox" checked> <span>${esc(T.visitLabel)}</span></label>` : ""}
          <label>${esc(T.dateLabel)}<select id="f-date">${days().map(d => `<option value="${d.v}">${d.t}</option>`).join("")}</select></label>
          <label class="wide">${esc(T.slotLabel || "Удобное время")}<div class="slots" id="f-slots">${CFG.slots.map((s, i) => `<button type="button" data-slot="${s}" class="${i === 3 ? "on" : ""}">${s}</button>`).join("")}</div></label>
          <label class="wide">Комментарий<textarea id="f-comment" rows="3" placeholder="${esc(T.commentPlaceholder)}"></textarea></label>
          <label class="check wide"><input id="f-consent" type="checkbox"> <span>Согласен на обработку персональных данных для связи по заявке (152-ФЗ)</span></label>
        </div>
      </div>
      <aside class="summary"><div class="sum-card">
        <div class="sum-h"><h3>Ваша смета</h3><small>ориентировочно</small></div>
        <div id="cart"></div>
        <div class="bar"><div><small id="bar-sub">Выберите услугу</small><b id="bar-sum">0 ₽</b></div><button id="submit" class="btn">Отправить заявку</button></div>
        <p class="note">${esc(CFG.priceNote)}</p>
      </div></aside>
    </section>

    ${T.stages?.length ? `<section class="sect" id="how"><div class="wrap">
      <div class="sect-h"><p class="eyebrow">${esc(T.stagesEyebrow || "Порядок работ")}</p><h2>${esc(T.stagesTitle || "Четыре этапа работы")}</h2></div>
      <ol class="stages">${T.stages.map((s, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><b>${esc(s.t)}</b><p>${esc(s.d)}</p></li>`).join("")}</ol>
    </div></section>` : ""}

    ${T.docs?.length ? `<section class="sect alt" id="docs"><div class="wrap docs-in">
      <div class="docs-l"><p class="eyebrow">${esc(T.docsEyebrow || "Документы и гарантия")}</p><h2>${esc(T.docsTitle || "Всё фиксируется на бумаге")}</h2>
        <div class="docs">${T.docs.map(d => `<div class="doc"><span class="ic-box">${ic(d.icon)}</span><div><b>${esc(d.t)}</b><p>${esc(d.d)}</p></div></div>`).join("")}</div>
        ${T.docsNote ? `<p class="demo-note">${esc(T.docsNote)}</p>` : ""}</div>
    </div></section>` : ""}

    ${T.directions?.length ? `<section class="sect"><div class="wrap">
      <div class="sect-h"><p class="eyebrow">${esc(T.dirsEyebrow)}</p><h2>${esc(T.dirsTitle || "Направления работ")}</h2></div>
      <div class="dirs">${T.directions.map(d => `<article class="dir"><img src="${esc(d.img)}" alt="${esc(d.t)}"><div><b>${esc(d.t)}</b><p>${esc(d.d)}</p></div></article>`).join("")}</div>
    </div></section>` : ""}

    <footer class="foot"><div class="wrap foot-in">
      <div><div class="brand light"><div class="logo"><span>${esc(S.brand.logoText)}</span></div><div><b>${esc(S.brand.name)}</b><small>${esc(S.brand.tagline)} · ${esc(S.brand.city)}</small></div></div></div>
      <div class="foot-c"><a href="${telHref()}">${esc(S.brand.phone)}</a><span>${esc(S.brand.workHours)}</span><a href="#/admin">${esc(T.adminLink)}</a></div>
      <p class="credits">${esc(T.credits)}</p>
    </div></footer>
  </main>`;
  bindGo();

  const f = draft.form;
  for (const k of ["name", "phone", "addr", "floor", "comment", "extra"]) { const el = $("#f-" + k); if (!el) continue; el.value = f[k] || ""; el.oninput = () => { f[k] = el.value; saveDraft(); }; }
  if (f.date && $(`#f-date option[value="${f.date}"]`)) $("#f-date").value = f.date;
  $("#f-date").onchange = e => { f.date = e.target.value; saveDraft(); };
  const zs = $("#f-zone"); if (zs) { if (f.zone && $(`#f-zone option[value="${f.zone}"]`)) zs.value = f.zone; else f.zone = zs.value; zs.onchange = () => { f.zone = zs.value; saveDraft(); renderCart(); }; }
  const vs = $("#f-visit"); if (vs) { if (f.visit === false) vs.checked = false; vs.onchange = () => { f.visit = vs.checked; saveDraft(); renderCart(); }; }
  if (f.slot) $$("#f-slots button").forEach(b => b.classList.toggle("on", b.dataset.slot === f.slot));
  $("#f-slots").onclick = e => { const b = e.target.closest("button"); if (!b) return; $$("#f-slots button").forEach(x => x.classList.toggle("on", x === b)); f.slot = b.dataset.slot; saveDraft(); };
  $("#f-phone").addEventListener("input", e => { let d = e.target.value.replace(/\D/g, ""); if (d[0] === "8") d = "7" + d.slice(1); if (d && d[0] !== "7") d = "7" + d; d = d.slice(0, 11);
    const p = d.slice(1); let s = "+7"; if (p.length) s += " (" + p.slice(0, 3); if (p.length >= 3) s += ") " + p.slice(3, 6); if (p.length >= 6) s += "-" + p.slice(6, 8); if (p.length >= 8) s += "-" + p.slice(8, 10);
    e.target.value = d ? s : ""; f.phone = e.target.value; saveDraft(); });
  $$(".item").forEach(b => b.onclick = () => openSheet(b.dataset.id));
  $("#photo").onchange = async e => { for (const file of e.target.files) { if (draft.photos.length >= 8) break; draft.photos.push(await compress(file)); } e.target.value = ""; renderThumbs(); };
  $("#submit").onclick = submit;
  renderCart(); renderThumbs();
}
function renderThumbs() {
  $("#thumbs").innerHTML = draft.photos.map((p, i) => `<div class="th"><img src="${p}" alt=""><button data-i="${i}" aria-label="Удалить">${ic("x")}</button></div>`).join("");
  $$("#thumbs button").forEach(b => b.onclick = () => { draft.photos.splice(+b.dataset.i, 1); renderThumbs(); });
}
function renderCart() {
  const cart = draft.cart, t = total(cart), z = zoneOf(draft.form.zone);
  $$(".item").forEach(b => { const n = cart.filter(l => l.itemId === b.dataset.id).reduce((a, l) => a + (itemById(l.itemId).perArea ? 1 : l.qty), 0);
    const q = $(".qty", b); q.hidden = !n; q.textContent = n; b.classList.toggle("active", !!n); });
  $("#cart").innerHTML = cart.length ? `<div class="cart">${cart.map((l, i) => `<div class="line"><span>${esc(lineTitle(l))}</span><b class="p">${rub(linePrice(l))}</b><span class="acts"><button data-e="${i}" aria-label="Изменить">${ic("edit")}Изменить</button><button data-d="${i}" aria-label="Удалить">${ic("trash")}Удалить</button></span></div>`).join("")}
    ${z?.fee ? `<div class="line muted"><span>${esc(T.zoneWord)}: ${esc(lc(z.title))}</span><b class="p">${rub(z.fee)}</b></div>` : ""}
    ${t.belowMin ? `<div class="line muted"><span>Минимальный заказ</span><b class="p">${rub(S.minOrder)}</b></div>` : ""}
    <div class="line total"><span>Итого, ориентировочно</span><b class="p">${rub(t.final)}</b></div></div>`
    : `<div class="cart-empty">${ic("ruler")}<p>Выберите услугу слева — здесь появится расчёт. ${esc(T.emptyCart)}</p></div>`;
  $$("#cart [data-d]").forEach(b => b.onclick = () => { cart.splice(+b.dataset.d, 1); saveDraft(); renderCart(); });
  $$("#cart [data-e]").forEach(b => b.onclick = () => openSheet(cart[+b.dataset.e].itemId, +b.dataset.e));
  const visit = !!T.visitLabel && draft.form.visit !== false;
  $("#bar-sum").textContent = cart.length ? rub(t.final) : visit ? (T.visitBar || "Осмотр — 0 ₽") : rub(0);
  $("#bar-sub").textContent = cart.length ? `${cart.length} ${plural(cart.length, "позиция", "позиции", "позиций")} · ориентир` : visit ? (T.visitBarSub || "Можно просто заказать выезд") : "Выберите услугу";
}
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };

function openSheet(itemId, editIndex = -1) {
  const it = itemById(itemId);
  const l = editIndex >= 0 ? { ...draft.cart[editIndex], extras: [...(draft.cart[editIndex].extras || [])] }
    : { itemId, variantId: it.variants?.[0]?.id, qty: 1, area: 4, amount: it.variants?.[0]?.def, sides: 1, fabric: S.fabrics[0]?.id, extras: [] };
  const exList = S.extras.filter(e => !e.for || e.for.includes(it.id));
  const wrap = document.createElement("div"); wrap.className = "sheet-wrap";
  const draw = () => {
    wrap.innerHTML = `<div class="sheet" role="dialog" aria-label="${esc(it.title)}">
      <div class="sheet-h"><span class="ic-box">${ic(it.model)}</span><div><small>Параметры расчёта</small><h3>${esc(it.title)}</h3></div><button class="x" aria-label="Закрыть">${ic("x")}</button></div>
      <div class="sheet-b">
      ${it.perArea ? `<label class="lbl">Площадь, м²</label><div class="stepper"><button data-a="-1">−</button><input id="area" type="number" min="1" step="0.5" value="${l.area}"><button data-a="1">+</button></div><small class="hint">Например, ковёр 2×3 м = 6 м²</small>`
        : `<label class="lbl">${esc(it.variantLabel || (it.perUnit ? "Вариант" : "Пакет"))}</label><div class="opts">${it.variants.map(v => `<button data-v="${v.id}" class="${v.id === l.variantId ? "on" : ""}">${esc(v.title)}<small>${rub(v.price)}${it.perUnit ? "/" + it.perUnit.unit : ""}</small></button>`).join("")}</div>${it.hint ? `<small class="hint">${esc(it.hint)}</small>` : ""}`}
      ${it.perUnit ? (() => { const v = it.variants.find(v => v.id === l.variantId) || it.variants[0]; return `<label class="lbl">${esc(it.perUnit.label)}</label><div class="stepper"><button data-u="-1">−</button><input id="amount" type="number" min="${v.min}" max="${v.max}" step="${it.perUnit.step}" value="${l.amount}"><button data-u="1">+</button></div><small class="hint">${esc(it.perUnit.hint)}</small>`; })() : ""}
      ${it.sides ? `<label class="lbl">Стороны</label><div class="opts"><button data-s="1" class="${l.sides === 1 ? "on" : ""}">Одна</button><button data-s="2" class="${l.sides === 2 ? "on" : ""}">Обе стороны</button></div>` : ""}
      ${S.fabrics.length > 1 ? `<label class="lbl">${esc(CFG.fabricLabel || "Класс авто")}</label><div class="opts">${S.fabrics.map(f => `<button data-f="${f.id}" class="${f.id === l.fabric ? "on" : ""}">${esc(f.title)}${f.k !== 1 ? `<small>+${Math.round((f.k - 1) * 100)}%</small>` : ""}</button>`).join("")}</div>` : ""}
      ${exList.length ? `<label class="lbl">Дополнительно</label><div class="opts">${exList.map(e => `<button data-x="${e.id}" class="${l.extras.includes(e.id) ? "on" : ""}">${esc(e.title)}<small>${e.type === "percent" ? "+" + e.value + "%" : "+" + rub(e.value)}</small></button>`).join("")}</div>` : ""}
      ${it.perArea || it.perUnit || !it.qtyLabel ? "" : `<label class="lbl">${esc(it.qtyLabel)}</label><div class="stepper"><button data-q="-1">−</button><input id="qty" type="number" min="1" value="${l.qty}"><button data-q="1">+</button></div>`}
      </div>
      <div class="sheet-f"><div><small>Стоимость позиции</small><b>${rub(linePrice(l))}</b></div><button class="btn big" id="add">${editIndex >= 0 ? "Сохранить" : "Добавить в смету"}</button></div>
    </div>`;
    $(".x", wrap).onclick = close; wrap.onclick = e => { if (e.target === wrap) close(); };
    $$("[data-v]", wrap).forEach(b => b.onclick = () => { l.variantId = b.dataset.v; if (it.perUnit) { const v = it.variants.find(v => v.id === l.variantId); if (!(l.amount >= v.min && l.amount <= v.max)) l.amount = v.def; } draw(); });
    const clampU = n => { const v = it.variants.find(v => v.id === l.variantId) || it.variants[0]; return Math.min(v.max || 1e4, Math.max(v.min || 1, n)); };
    $$("[data-u]", wrap).forEach(b => b.onclick = () => { l.amount = clampU(+l.amount + +b.dataset.u * it.perUnit.step); draw(); });
    const am = $("#amount", wrap); if (am) am.onchange = () => { l.amount = clampU(parseInt(am.value) || 0); draw(); };
    $$("[data-s]", wrap).forEach(b => b.onclick = () => { l.sides = +b.dataset.s; draw(); });
    $$("[data-f]", wrap).forEach(b => b.onclick = () => { l.fabric = b.dataset.f; draw(); });
    $$("[data-x]", wrap).forEach(b => b.onclick = () => { const i = l.extras.indexOf(b.dataset.x); i >= 0 ? l.extras.splice(i, 1) : l.extras.push(b.dataset.x); draw(); });
    $$("[data-q]", wrap).forEach(b => b.onclick = () => { l.qty = Math.max(1, l.qty + +b.dataset.q); draw(); });
    $$("[data-a]", wrap).forEach(b => b.onclick = () => { l.area = Math.max(1, +l.area + +b.dataset.a); draw(); });
    const q = $("#qty", wrap); if (q) q.onchange = () => { l.qty = Math.max(1, parseInt(q.value) || 1); draw(); };
    const a = $("#area", wrap); if (a) a.onchange = () => { l.area = Math.max(1, parseFloat(a.value) || 1); draw(); };
    $("#add", wrap).onclick = () => { if (editIndex >= 0) draft.cart[editIndex] = l; else draft.cart.push(l); saveDraft(); renderCart(); close(); toast(editIndex >= 0 ? "Сохранено" : "Добавлено в заказ"); };
  };
  const close = () => { wrap.classList.remove("show"); setTimeout(() => wrap.remove(), 200); };
  document.body.appendChild(wrap); draw(); requestAnimationFrame(() => wrap.classList.add("show"));
}

function compress(file) {
  return new Promise(res => { const img = new Image(); img.onload = () => { const k = Math.min(1, 1280 / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = img.width * k; c.height = img.height * k; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src); res(c.toDataURL("image/jpeg", 0.8)); }; img.src = URL.createObjectURL(file); });
}

async function submit() {
  const f = draft.form;
  f.date = f.date || $("#f-date").value; f.slot = f.slot || $("#f-slots .on")?.dataset.slot;
  f.visit = $("#f-visit") ? $("#f-visit").checked : false;
  const err = !draft.cart.length && !f.visit ? (T.emptyErr || "Выберите услугу или отметьте выезд на осмотр") : !f.name ? "Укажите имя" : (f.phone || "").replace(/\D/g, "").length < 11 ? "Укажите телефон" : !f.addr && !T.addrOptional ? T.addrErr : !$("#f-consent").checked ? "Нужно согласие на обработку данных" : "";
  if (err) { toast(err); const t = !draft.cart.length && !f.visit ? ".grid" : !f.name ? "#f-name" : !f.addr && !T.addrOptional ? "#f-addr" : (f.phone || "").length < 11 ? "#f-phone" : "#f-consent"; $(t)?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
  const btn = $("#submit"); btn.disabled = true; btn.textContent = "Отправляем…";
  const t = total(draft.cart), z = zoneOf(f.zone);
  const items = draft.cart.map(l => ({ ...l, title: lineTitle(l), price: Math.round(linePrice(l)) }));
  if (draft.cart.length && z?.fee) items.push({ itemId: "_zone", title: T.zoneWord + ": " + lc(z.title), price: z.fee });
  const req = { client: { name: f.name, phone: f.phone, address: f.addr || T.addrEmpty || "", floor: f.floor || "", comment: f.comment || "", extra: f.extra || "", visit: !!f.visit, zone: z?.title || "" },
    date: f.date, slot: f.slot, items,
    estimate: Math.round(t.final), photos: draft.photos };
  try {
    const r = await Store.create(req);
    const mine = JSON.parse(localStorage.getItem(NS + "myRequests") || "[]"); mine.unshift(r.id); localStorage.setItem(NS + "myRequests", JSON.stringify(mine.slice(0, 20)));
    draft.cart = []; draft.photos = []; saveDraft();
    location.hash = "#/r/" + r.id;
  } catch (e) { toast("Не удалось отправить. Попробуйте ещё раз"); btn.disabled = false; btn.textContent = "Отправить заявку"; }
}

// ------------------------------ статус заявки ------------------------------
let statusTimer = null;
async function renderStatus(id) {
  const r = await Store.get(id);
  const app = $("#app");
  if (!r) { app.innerHTML = header(callBtn()) + `<main class="client"><div class="wrap narrow"><div class="card"><h2>Заявка не найдена</h2><p>Проверьте ссылку. В демо-версии заявки хранятся только на этом устройстве.</p><a class="btn" href="#/">Новая заявка</a></div></div></main>`; return; }
  const idx = STATUS_ORDER.indexOf(r.status);
  const when = r.confirmedTime || `${new Date(r.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, ${r.slot}`;
  const sic = { new: "inbox", confirmed: "calendar", onway: T.onwayIcon || "clock", done: "check", canceled: "x" }[r.status];
  app.innerHTML = header(callBtn()) + `<main class="client status"><div class="wrap narrow">
    <div class="card hero-ok"><span class="st-ic st-${r.status}">${ic(sic)}</span>
      <div><small class="muted">Статус заявки</small><h1>Заявка № ${esc(r.id)}</h1><p class="st-label st-${r.status}">${STATUS[r.status]}</p>
      <p>${r.status === "new" ? esc(T.newText) : r.status === "confirmed" ? esc(T.confirmedText) : r.status === "onway" ? esc(T.onwayText) : r.status === "done" ? esc(T.doneText) : "Заявка отменена."}</p></div></div>
    ${r.status !== "canceled" ? `<ol class="timeline">${STATUS_ORDER.map((s, i) => `<li class="${i <= idx ? "done" : ""}${i === idx ? " cur" : ""}"><span>${i < idx || r.status === "done" ? ic("check") : i + 1}</span>${STATUS[s]}</li>`).join("")}</ol>` : ""}
    <div class="card"><h3>Детали заявки</h3>
      <div class="kv"><span>Когда</span><b>${esc(when)}</b></div>
      <div class="kv"><span>${esc(T.addrLabel)}</span><b>${esc(r.client.address)}${r.client.floor ? ", " + esc(r.client.floor) : ""}</b></div>
      ${r.client.extra ? `<div class="kv"><span>${esc(T.extraLabel || "Дополнительно")}</span><b>${esc(r.client.extra)}</b></div>` : ""}
      ${r.client.visit ? `<div class="kv"><span>${esc(T.visitKv)}</span><b class="p">бесплатно</b></div>` : ""}
      ${r.items.map(i => `<div class="kv"><span>${esc(i.title)}</span><b class="p">${rub(i.price)}</b></div>`).join("")}
      <div class="kv total"><span>${r.finalPrice ? "Цена подтверждена " + esc(T.ownerWord) : "Ориентировочно"}</span><b class="p">${money(r.finalPrice || r.estimate)}</b></div>
      ${r.masterNote ? `<div class="note-box">${ic("msg")}<span>${esc(r.masterNote)}</span></div>` : ""}</div>
    <div class="row"><button class="btn ghost" id="copy">${ic("link")} Скопировать ссылку</button><a class="btn" href="#/">Новая заявка</a></div>
    <p class="note">Ссылка на эту страницу — ваш личный статус заявки. ${CFG.storage === "local" ? "Демо-версия: статус хранится на этом устройстве." : ""}</p>
  </div></main>`;
  $("#copy").onclick = () => { navigator.clipboard?.writeText(location.href); toast("Ссылка скопирована"); };
  clearInterval(statusTimer); statusTimer = setInterval(() => { if (location.hash === "#/r/" + id) renderStatus(id); else clearInterval(statusTimer); }, 15000);
}

// ================================ КАБИНЕТ ================================
let tab = "requests", filter = "all";
function renderAdmin() {
  if (sessionStorage.getItem(NS + "authed") !== "1") return renderPin();
  const app = $("#app");
  app.innerHTML = header(`<span class="role">${esc(T.cabinetTitle)}</span><button class="btn ghost sm" id="logout" title="Выйти">${ic("logout")}<span>Выйти</span></button>`) + `<main class="admin wrap">
    <nav class="tabs">${[["requests", "Заявки"], ["prices", "Прайс"], ["biz", "Бизнес"]].map(([k, t]) => `<button data-t="${k}" class="${tab === k ? "on" : ""}">${t}</button>`).join("")}</nav>
    <div id="pane"></div></main>`;
  $("#logout").onclick = () => { sessionStorage.removeItem(NS + "authed"); renderAdmin(); };
  $$(".tabs button").forEach(b => b.onclick = () => { tab = b.dataset.t; renderAdmin(); });
  ({ requests: paneRequests, prices: panePrices, biz: paneBiz })[tab]();
}
function renderPin() {
  $("#app").innerHTML = header() + `<main class="admin wrap"><div class="card pin"><span class="ic-box">${ic("shield")}</span><h2>${esc(T.cabinetTitle)}</h2><p>Введите PIN-код</p>
    <input id="pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"><button class="btn big" id="go">Войти</button>
    ${CFG.storage === "local" ? `<p class="note">Демо: PIN <b>${esc(CFG.adminPin)}</b></p>` : ""}</div></main>`;
  const go = async () => { if (await Store.login($("#pin").value)) { sessionStorage.setItem(NS + "authed", "1"); renderAdmin(); } else toast("Неверный PIN"); };
  $("#go").onclick = go; $("#pin").onkeydown = e => { if (e.key === "Enter") go(); }; $("#pin").focus();
}
async function paneRequests() {
  const all = await Store.list();
  const counts = Object.fromEntries(Object.keys(STATUS).map(k => [k, all.filter(r => r.status === k).length]));
  const list = filter === "all" ? all : all.filter(r => r.status === filter);
  $("#pane").innerHTML = `
    <div class="stats"><div><b>${counts.new}</b><small>новых</small></div><div><b>${counts.confirmed + counts.onway}</b><small>в работе</small></div><div><b class="p">${rub(all.filter(r => r.status === "done").reduce((a, r) => a + (r.finalPrice || r.estimate), 0))}</b><small>выполнено</small></div></div>
    <div class="filters">${[["all", "Все"], ...Object.entries(STATUS)].map(([k, t]) => `<button data-f="${k}" class="${filter === k ? "on" : ""}">${t}${k !== "all" && counts[k] ? ` <i>${counts[k]}</i>` : ""}</button>`).join("")}</div>
    ${list.length ? `<div class="reqs">${CFG.groupByDate ? byDate(list) : list.map(reqCard).join("")}</div>` : `<div class="card empty"><p>Заявок пока нет.</p><p>Откройте <a href="#/">страницу клиента</a> и отправьте тестовую заявку${CFG.storage === "local" ? " или добавьте примеры" : ""}.</p>${CFG.storage === "local" ? `<button class="btn ghost" id="seed">Добавить примеры заявок</button>` : ""}</div>`}`;
  $$(".filters button").forEach(b => b.onclick = () => { filter = b.dataset.f; paneRequests(); });
  $("#seed") && ($("#seed").onclick = async () => { await seed(); paneRequests(); });
  $$(".req").forEach(el => {
    const id = el.dataset.id;
    $(".save", el).onclick = async () => {
      const patch = { status: $(".st", el).value, finalPrice: +$(".fp", el).value || null, confirmedTime: $(".ct", el).value.trim(), masterNote: $(".mn", el).value.trim() };
      if (patch.status === "new" && (patch.finalPrice || patch.confirmedTime)) patch.status = "confirmed";
      await Store.update(id, patch); toast("Сохранено. Клиент увидит статус по своей ссылке"); paneRequests();
    };
    $(".link", el).onclick = () => { const u = location.href.split("#")[0] + "#/r/" + id; navigator.clipboard?.writeText(u); toast("Ссылка для клиента скопирована"); };
    $$(".ph img", el).forEach(img => img.onclick = () => { const w = document.createElement("div"); w.className = "lightbox"; w.innerHTML = `<img src="${img.src}">`; w.onclick = () => w.remove(); document.body.appendChild(w); });
  });
}
function byDate(list) {
  const key = r => r.date + " " + String(r.slot || "").padStart(5, "0");
  const closed = r => r.status === "done" || r.status === "canceled";
  const sorted = list.filter(r => !closed(r)).sort((a, b) => key(a).localeCompare(key(b)));
  const old = list.filter(closed).sort((a, b) => key(b).localeCompare(key(a)));
  let out = "", cur = "";
  for (const r of sorted) { if (r.date !== cur) { cur = r.date; const n = sorted.filter(x => x.date === cur).length;
    out += `<h3 class="day-h">${ic("calendar")}${(t => t[0].toUpperCase() + t.slice(1))(new Date(cur).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }))}<small>${n} ${plural(n, T.orderWord1 || "заявка", T.orderWord2 || "заявки", T.orderWord5 || "заявок")}</small></h3>`; }
    out += reqCard(r); }
  if (old.length) out += `<h3 class="day-h">${ic("check")}Выполненные и отменённые<small>${old.length}</small></h3>` + old.map(reqCard).join("");
  return out;
}
function reqCard(r) {
  const dt = new Date(r.createdAt);
  return `<article class="card req" data-id="${r.id}">
    <div class="req-h"><span class="pill st-${r.status}">${STATUS[r.status]}</span><b>№ ${r.id}</b><small>${dt.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} ${dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</small></div>
    <div class="who"><b>${esc(r.client.name)}</b> · <a href="tel:${esc(r.client.phone.replace(/[^+\d]/g, ""))}">${esc(r.client.phone)}</a></div>
    <div class="addr">${ic("pin")}<span>${esc(r.client.address)}${r.client.floor ? ", " + esc(r.client.floor) : ""}${r.client.zone && r.client.zone.toLowerCase() !== (r.client.address || "").toLowerCase() ? ` <small>(${esc(lc(r.client.zone))})</small>` : ""}</span></div>
    ${r.client.extra ? `<div class="addr">${ic(T.extraIcon || "doc")}<span>${esc(T.extraLabel || "")}: <b>${esc(r.client.extra)}</b></span></div>` : ""}
    ${r.client.visit ? `<div class="addr">${ic("search")}<b>${esc(T.visitAdmin)}</b></div>` : ""}
    <div class="addr">${ic("clock")}<span>${new Date(r.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" })}, ${esc(r.slot)}</span></div>
    <ul class="items">${r.items.map(i => `<li><span>${esc(i.title)}</span><b class="p">${rub(i.price)}</b></li>`).join("")}<li class="sum"><span>Расчёт приложения</span><b class="p">${money(r.estimate)}</b></li></ul>
    ${r.client.comment ? `<div class="note-box">${ic("msg")}<span>${esc(r.client.comment)}</span></div>` : ""}
    ${r.photos?.length ? `<div class="ph">${r.photos.map(p => `<img src="${p}" alt="фото">`).join("")}</div>` : ""}
    <div class="ctrl">
      <label>Статус<select class="st">${Object.entries(STATUS).map(([k, t]) => `<option value="${k}" ${k === r.status ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <label>Итоговая цена, ₽<input class="fp" type="number" placeholder="${r.estimate || ""}" value="${r.finalPrice || ""}"></label>
      <label class="wide">Подтверждённое время<input class="ct" placeholder="Например: 18 ноября, 15:00" value="${esc(r.confirmedTime || "")}"></label>
      <label class="wide">Сообщение клиенту<input class="mn" placeholder="${esc(T.noteExample)}" value="${esc(r.masterNote || "")}"></label>
    </div>
    <div class="row"><button class="btn save">Сохранить и подтвердить</button><button class="btn ghost link">${ic("link")} Ссылка клиента</button></div>
  </article>`;
}
function panePrices() {
  const p = $("#pane");
  p.innerHTML = `<div class="card"><h3>Прайс-лист</h3><p class="note">Изменения сразу появляются у клиентов в калькуляторе.</p>
    ${S.items.map((it, i) => `<div class="pr"><b>${esc(it.title)}</b>${it.perArea ? `<label>за м²<input type="number" data-i="${i}" data-k="m2" value="${it.pricePerM2}"></label>` : it.variants.map((v, j) => `<label>${esc(v.title)}${it.perUnit ? ", ₽/" + it.perUnit.unit : ""}<input type="number" data-i="${i}" data-j="${j}" value="${v.price}"></label>`).join("")}</div>`).join("")}
    <div class="pr"><b>Дополнительно</b>${S.extras.map((e, i) => `<label>${esc(e.title)}, ${e.type === "percent" ? "%" : "₽"}<input type="number" data-e="${i}" value="${e.value}"></label>`).join("")}</div>
    ${S.fabrics.length ? `<div class="pr"><b>${esc(CFG.fabricLabel || "Класс авто")} (коэффициент)</b>${S.fabrics.map((f, i) => `<label>${esc(f.title)}<input type="number" step="0.05" data-fb="${i}" value="${f.k}"></label>`).join("")}</div>` : ""}
    ${S.zones?.length ? `<div class="pr"><b>${esc(T.zoneWord)} по удалённости, ₽</b>${S.zones.map((z, i) => `<label>${esc(z.title)}<input type="number" data-z="${i}" value="${z.fee}"></label>`).join("")}</div>` : ""}
    <div class="pr"><b>Общее</b><label>Минимальный заказ, ₽<input type="number" id="minOrder" value="${S.minOrder}"></label><label>Доплата за срочность, ₽<input type="number" id="travel" value="${S.travelFee}"></label></div>
    <div class="row"><button class="btn" id="savep">Сохранить прайс</button><button class="btn ghost" id="resetp">Вернуть по умолчанию</button></div></div>`;
  $("#savep").onclick = async () => {
    $$("input[data-i]", p).forEach(inp => { const it = S.items[+inp.dataset.i]; if (inp.dataset.k === "m2") it.pricePerM2 = +inp.value; else it.variants[+inp.dataset.j].price = +inp.value; });
    $$("input[data-e]", p).forEach(inp => S.extras[+inp.dataset.e].value = +inp.value);
    $$("input[data-fb]", p).forEach(inp => S.fabrics[+inp.dataset.fb].k = +inp.value);
    $$("input[data-z]", p).forEach(inp => S.zones[+inp.dataset.z].fee = +inp.value);
    S.minOrder = +$("#minOrder").value; S.travelFee = +$("#travel").value;
    await Store.saveSettings(S); toast("Прайс сохранён");
  };
  $("#resetp").onclick = async () => { const b = S.brand; S = { ...defaults(), brand: b }; await Store.saveSettings(S); panePrices(); toast("Прайс сброшен"); };
}
function paneBiz() {
  const b = S.brand;
  $("#pane").innerHTML = `<div class="card"><h3>Данные бизнеса</h3>
    <div class="form">${[["name", "Название"], ["tagline", "Подпись"], ["city", "Город"], ["phone", "Телефон"], ["workHours", "Часы работы"], ["logoText", "Буква логотипа"]].map(([k, t]) => `<label>${t}<input data-b="${k}" value="${esc(b[k] || "")}"></label>`).join("")}</div>
    <div class="row"><button class="btn" id="saveb">Сохранить</button></div>
    <p class="note">Цвета, PIN и способ хранения меняются в файле <code>config.js</code> (см. ADAPT.md).</p></div>
    ${CFG.storage === "local" ? `<div class="card"><h3>Демо</h3><div class="row"><button class="btn ghost" id="seed2">Добавить примеры заявок</button><button class="btn ghost" id="wipe">Удалить все заявки</button></div></div>` : ""}`;
  $("#saveb").onclick = async () => { $$("[data-b]").forEach(i => b[i.dataset.b] = i.value); await Store.saveSettings(S); applyBrand(); renderAdmin(); toast("Сохранено"); };
  $("#seed2") && ($("#seed2").onclick = async () => { await seed(); toast("Примеры добавлены"); });
  $("#wipe") && ($("#wipe").onclick = async () => { if (!confirm("Удалить все заявки?")) return; for (const r of await Store.list()) await Store.remove(r.id); toast("Удалено"); });
}

// примерные заявки для демонстрации кабинета
async function seed() {
  const d = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const mk = (cart, client, date, slot, zone = "z0") => { const z = zoneOf(zone); const items = cart.map(l => ({ ...l, title: lineTitle(l), price: Math.round(linePrice(l)) }));
    if (cart.length && z.fee) items.push({ itemId: "_zone", title: T.zoneWord + ": " + lc(z.title), price: z.fee });
    return { client: { ...client, zone: z.title }, date, slot, items, estimate: Math.round(total(cart, zone).final), photos: [sampleImg(cart[0]?.itemId)] }; };
  if (CFG.seed) { for (const x of CFG.seed) { const r = await Store.create(mk(x.cart, x.client, d(x.day), x.slot, x.zone || "z0")); if (x.update) await Store.update(r.id, x.update); } return; }
  const a = await Store.create(mk([{ itemId: "fence", variantId: "prof", amount: 85, extras: ["high"] }, { itemId: "gate", variantId: "slide", qty: 1, extras: ["auto"] }, { itemId: "gate", variantId: "wicket", qty: 1, extras: [] }],
    { name: "Сергей", phone: "+7 (916) 123-45-67", address: "Истринский р-н, СНТ «Берёзка», уч. 48", floor: "", comment: "Участок 12 соток, вдоль дороги небольшой уклон", visit: true }, d(1), "11:00", "z1"));
  const b = await Store.create(mk([{ itemId: "bath", variantId: "beam", amount: 24, extras: ["stove", "lining"] }],
    { name: "Марина", phone: "+7 (925) 765-43-21", address: "д. Ивановка, ул. Лесная, 12", floor: "", comment: "Баня 6×4 с комнатой отдыха, участок ровный", visit: true }, d(2), "13:00"));
  await Store.update(b.id, { status: "confirmed", finalPrice: 1150000, confirmedTime: "через 2 дня, 13:00", masterNote: "Посмотрим грунт под сваи и место под дымоход, смету пришлём в тот же день" });
  const c = await Store.create(mk([{ itemId: "canopy", variantId: "poly", amount: 18, extras: ["drain"] }],
    { name: "Алексей", phone: "+7 (903) 555-12-34", address: "СНТ «Рассвет», уч. 112", floor: "", comment: "Навес на одну машину у ворот", visit: false }, d(0), "9:00"));
  await Store.update(c.id, { status: "done", finalPrice: 92000 });
}
function sampleImg(kind) { if (CFG.sampleImgs) return CFG.sampleImgs[kind] || CFG.sampleImgs.default; return kind === "bath" ? "img/bath.webp" : "img/fence.webp"; }

// ================================ РОУТЕР ================================
async function route() {
  const h = location.hash || "#/";
  document.body.dataset.page = h.startsWith("#/admin") ? "admin" : h.startsWith("#/r/") ? "status" : "client";
  window.scrollTo(0, 0);
  if (h.startsWith("#/admin")) return renderAdmin();
  if (h.startsWith("#/r/")) return renderStatus(decodeURIComponent(h.slice(4)));
  renderClient();
}
(async () => {
  await loadSettings();
  window.addEventListener("hashchange", route);
  await route();
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
