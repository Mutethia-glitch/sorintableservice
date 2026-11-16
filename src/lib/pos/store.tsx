import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { makeSeed } from "./seed";
import { isUnverified, openOrderForTable } from "./logic";
import type { Collector, PayMethod, PosState, Staff, Ticket } from "./types";

const DATA_KEY = "sorin-pos-demo-v1";
const SESSION_KEY = "sorin-pos-session"; // sessionStorage: per browser tab

interface Ctx {
  state: PosState;
  ready: boolean;
  user: Staff | null;
  login: (pin: string) => Staff | null;
  logout: () => void;
  verifyManager: (pin: string) => Staff | null;
  addToDraft: (tableId: string, itemId: string) => void;
  changeDraftQty: (tableId: string, lineId: string, delta: number) => void;
  setDraftNote: (tableId: string, lineId: string, note: string) => void;
  clearDraft: (tableId: string) => void;
  sendOrder: (tableId: string) => Ticket | null;
  setAwaiting: (orderId: string, v: boolean) => void;
  recordPayment: (orderId: string, p: { method: PayMethod; amount: number; collector: Collector; reference: string; note: string }) => void;
  closeBill: (orderId: string) => boolean;
  cancelOrder: (orderId: string) => void;
  markPrinted: (ticketId: string) => void;
  toggleAvailability: (itemId: string) => void;
  setPrice: (itemId: string, price: number) => void;
  toggleStaff: (staffId: string) => void;
  resetDemo: () => void;
}

const PosContext = createContext<Ctx | null>(null);

export function PosProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PosState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const stateRef = useRef<PosState | null>(null);
  const sending = useRef(new Set<string>());

  useEffect(() => {
    let s: PosState | null = null;
    try { const raw = localStorage.getItem(DATA_KEY); if (raw) s = JSON.parse(raw); } catch { s = null; }
    if (!s || s.version !== 1) s = makeSeed(Date.now());
    stateRef.current = s; setState(s);
    setUserId(sessionStorage.getItem(SESSION_KEY));
  }, []);

  const update = useCallback((fn: (s: PosState) => PosState) => {
    const cur = stateRef.current; if (!cur) return;
    const next = fn(cur);
    stateRef.current = next; setState(next);
    try { localStorage.setItem(DATA_KEY, JSON.stringify(next)); } catch { /* storage full: keep in memory */ }
  }, []);

  const nid = (s: PosState, p: string) => { s.seq.id += 1; return `${p}-${s.seq.id}`; };
  const clone = (s: PosState): PosState => structuredClone(s);

  const user = state && userId ? state.staff.find((x) => x.id === userId && x.active) ?? null : null;

  const login = useCallback((pin: string) => {
    const s = stateRef.current; if (!s) return null;
    const matches = s.staff.filter((x) => x.active && x.pin === pin);
    if (matches.length !== 1) return null; // demo: exact unique match only
    sessionStorage.setItem(SESSION_KEY, matches[0].id); setUserId(matches[0].id);
    return matches[0];
  }, []);
  const logout = useCallback(() => { sessionStorage.removeItem(SESSION_KEY); setUserId(null); }, []);
  const verifyManager = useCallback((pin: string) =>
    stateRef.current?.staff.find((x) => x.active && x.role === "manager" && x.pin === pin) ?? null, []);

  const api = useMemo(() => ({
    addToDraft: (tableId: string, itemId: string) => update((cur) => {
      const s = clone(cur); const d = (s.drafts[tableId] ??= []);
      const ex = d.find((l) => l.itemId === itemId && !l.note);
      if (ex) ex.qty += 1; else d.push({ id: nid(s, "d"), itemId, qty: 1, note: "" });
      return s;
    }),
    changeDraftQty: (tableId: string, lineId: string, delta: number) => update((cur) => {
      const s = clone(cur); const d = s.drafts[tableId] ?? [];
      const l = d.find((x) => x.id === lineId); if (!l) return cur;
      l.qty += delta; s.drafts[tableId] = d.filter((x) => x.qty > 0); return s;
    }),
    setDraftNote: (tableId: string, lineId: string, note: string) => update((cur) => {
      const s = clone(cur); const l = s.drafts[tableId]?.find((x) => x.id === lineId); if (l) l.note = note; return s;
    }),
    clearDraft: (tableId: string) => update((cur) => { const s = clone(cur); delete s.drafts[tableId]; return s; }),
    setAwaiting: (orderId: string, v: boolean) => update((cur) => {
      const s = clone(cur); const o = s.orders.find((x) => x.id === orderId); if (o) o.awaitingPayment = v; return s;
    }),
    cancelOrder: (orderId: string) => update((cur) => {
      const s = clone(cur); const o = s.orders.find((x) => x.id === orderId);
      if (o && o.payments.length === 0) { o.status = "cancelled"; o.closedAt = Date.now(); } return s;
    }),
    markPrinted: (ticketId: string) => update((cur) => {
      const s = clone(cur); const t = s.tickets.find((x) => x.id === ticketId);
      if (t) { t.status = "printed"; t.printCount += 1; } return s;
    }),
    toggleAvailability: (itemId: string) => update((cur) => {
      const s = clone(cur); const m = s.menu.find((x) => x.id === itemId); if (m) m.available = !m.available; return s;
    }),
    setPrice: (itemId: string, price: number) => update((cur) => {
      const s = clone(cur); const m = s.menu.find((x) => x.id === itemId); if (m) m.price = price; return s;
    }),
    toggleStaff: (staffId: string) => update((cur) => {
      const s = clone(cur); const m = s.staff.find((x) => x.id === staffId); if (m) m.active = !m.active; return s;
    }),
    resetDemo: () => update(() => makeSeed(Date.now())),
  }), [update]);

  const sendOrder = useCallback((tableId: string): Ticket | null => {
    const cur = stateRef.current; const uid = sessionStorage.getItem(SESSION_KEY);
    if (!cur || !uid || sending.current.has(tableId)) return null; // duplicate-click guard
    const draft = cur.drafts[tableId] ?? []; if (!draft.length) return null;
    sending.current.add(tableId);
    let ticket: Ticket | null = null;
    update((c) => {
      const s = clone(c); const now = Date.now();
      let o = openOrderForTable(s, tableId);
      const kind = o ? "addition" : "initial";
      if (!o) {
        s.seq.order += 1;
        o = { id: nid(s, "o"), number: s.seq.order, tableId, waiterId: uid, status: "open", awaitingPayment: false, createdAt: now, lines: [], payments: [] };
        s.orders.push(o);
      }
      s.seq.ticket += 1;
      const t: Ticket = { id: nid(s, "k"), number: s.seq.ticket, orderId: o.id, orderNumber: o.number, tableId, waiterId: uid, createdAt: now, kind, items: [], status: "queued", printCount: 0 };
      for (const d of s.drafts[tableId] ?? []) {
        const mi = s.menu.find((x) => x.id === d.itemId); if (!mi) continue;
        o.lines.push({ id: nid(s, "l"), itemId: mi.id, name: mi.name, price: mi.price, qty: d.qty, note: d.note.trim(), ticketId: t.id, sentAt: now });
        t.items.push({ name: mi.name, qty: d.qty, note: d.note.trim() });
      }
      o.awaitingPayment = false;
      s.tickets.push(t); delete s.drafts[tableId]; ticket = t; return s;
    });
    setTimeout(() => sending.current.delete(tableId), 800);
    return ticket;
  }, [update]);

  const recordPayment: Ctx["recordPayment"] = useCallback((orderId, p) => update((cur) => {
    const s = clone(cur); const o = s.orders.find((x) => x.id === orderId);
    const uid = sessionStorage.getItem(SESSION_KEY);
    if (!o || o.status !== "open" || !uid || p.amount <= 0) return cur;
    o.payments.push({ ...p, id: nid(s, "p"), at: Date.now(), recordedById: uid, unverified: isUnverified(p.method, p.collector) });
    o.awaitingPayment = true; return s;
  }), [update]);

  const closeBill = useCallback((orderId: string) => {
    const cur = stateRef.current; const uid = sessionStorage.getItem(SESSION_KEY);
    const o = cur?.orders.find((x) => x.id === orderId);
    if (!o || !uid) return false;
    const total = o.lines.reduce((t, l) => t + l.qty * l.price, 0), paid = o.payments.reduce((t, x) => t + x.amount, 0);
    if (o.status !== "open" || total <= 0 || paid < total) return false;
    update((c) => {
      const s = clone(c); const oo = s.orders.find((x) => x.id === orderId)!;
      oo.status = "closed"; oo.closedAt = Date.now(); oo.closedById = uid; oo.awaitingPayment = false; return s;
    });
    return true;
  }, [update]);

  if (!state) return <PosContext.Provider value={null}>{children}</PosContext.Provider>;
  return (
    <PosContext.Provider value={{ state, ready: true, user, login, logout, verifyManager, sendOrder, recordPayment, closeBill, ...api }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePosMaybe() { return useContext(PosContext); }
export function usePos() {
  const c = useContext(PosContext);
  if (!c) throw new Error("usePos used before POS data loaded");
  return c;
}
export const staffName = (s: PosState, id?: string) => s.staff.find((x) => x.id === id)?.name ?? "—";
export const tableName = (s: PosState, id: string) => s.tables.find((x) => x.id === id)?.name ?? id;
