// Хранилище заявок с подключаемым бэкендом.
// Интерфейс адаптера: list(), get(id), create(req), update(id, patch),
//                     getSettings(), saveSettings(s), login(pin)
const CFG = window.APP_CONFIG;

function uid(n = 6) {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = ""; const r = crypto.getRandomValues(new Uint8Array(n));
  for (const x of r) s += a[x % a.length];
  return s;
}

// ---------------- Local (IndexedDB) — для публичного демо ----------------
class LocalAdapter {
  constructor() { this.dbp = null; }
  db() {
    if (!this.dbp) this.dbp = new Promise((res, rej) => {
      const r = indexedDB.open(CFG.dbName || "app-demo", 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore("requests", { keyPath: "id" });
        d.createObjectStore("kv");
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return this.dbp;
  }
  async tx(store, mode, fn) {
    const d = await this.db();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode); const s = t.objectStore(store);
      const out = fn(s);
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  }
  async list() {
    const all = await this.tx("requests", "readonly", s => s.getAll());
    return all.sort((a, b) => b.createdAt - a.createdAt);
  }
  async get(id) { return (await this.tx("requests", "readonly", s => s.get(id))) || null; }
  async create(req) {
    const r = { ...req, id: uid(), createdAt: Date.now(), status: "new", history: [{ at: Date.now(), status: "new" }] };
    await this.tx("requests", "readwrite", s => s.put(r));
    return r;
  }
  async update(id, patch) {
    const r = await this.get(id); if (!r) throw new Error("not found");
    const n = { ...r, ...patch };
    if (patch.status && patch.status !== r.status) n.history = [...(r.history || []), { at: Date.now(), status: patch.status }];
    await this.tx("requests", "readwrite", s => s.put(n));
    return n;
  }
  async remove(id) { await this.tx("requests", "readwrite", s => s.delete(id)); }
  async getSettings() { return (await this.tx("kv", "readonly", s => s.get("settings"))) || null; }
  async saveSettings(v) { await this.tx("kv", "readwrite", s => s.put(v, "settings")); return v; }
  async login(pin) { return pin === CFG.adminPin; }
}

// ---------------- Remote (свой сервер, см. /server) ----------------
class RemoteAdapter {
  constructor(base) { this.base = base; this.token = sessionStorage.getItem("adm") || ""; }
  async call(path, opt = {}) {
    const r = await fetch(this.base + path, {
      ...opt, headers: { "Content-Type": "application/json", ...(this.token ? { Authorization: "Bearer " + this.token } : {}), ...(opt.headers || {}) },
    });
    if (!r.ok) throw new Error("API " + r.status);
    return r.json();
  }
  list() { return this.call("/requests"); }
  get(id) { return this.call("/requests/" + encodeURIComponent(id)).catch(() => null); }
  create(req) { return this.call("/requests", { method: "POST", body: JSON.stringify(req) }); }
  update(id, patch) { return this.call("/requests/" + id, { method: "PATCH", body: JSON.stringify(patch) }); }
  remove(id) { return this.call("/requests/" + id, { method: "DELETE" }); }
  getSettings() { return this.call("/settings").catch(() => null); }
  saveSettings(v) { return this.call("/settings", { method: "PUT", body: JSON.stringify(v) }); }
  async login(pin) {
    try { const r = await this.call("/login", { method: "POST", body: JSON.stringify({ pin }) });
      this.token = r.token; sessionStorage.setItem("adm", r.token); return true; } catch { return false; }
  }
}

window.Store = CFG.storage === "remote" ? new RemoteAdapter(CFG.apiBase) : new LocalAdapter();
