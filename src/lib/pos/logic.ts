import type { Collector, Order, PayMethod, PosState, TableStatus } from "./types";

export const kes = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const orderTotal = (o: Order) => o.lines.reduce((s, l) => s + l.price * l.qty, 0);
export const orderPaid = (o: Order) => o.payments.reduce((s, p) => s + p.amount, 0);
export const orderBalance = (o: Order) => Math.max(0, orderTotal(o) - orderPaid(o));
export const isFullyPaid = (o: Order) => orderTotal(o) > 0 && orderPaid(o) >= orderTotal(o);

/** Only cash physically collected by staff is "direct"; cashier or electronic payments can't be verified here. */
export const isUnverified = (method: PayMethod, collector: Collector) => collector === "Cashier" || method !== "Cash";

export const openOrderForTable = (s: PosState, tableId: string) =>
  s.orders.find((o) => o.tableId === tableId && o.status === "open");

export function tableStatus(s: PosState, tableId: string): TableStatus {
  const o = openOrderForTable(s, tableId);
  if (!o) return (s.drafts[tableId]?.length ?? 0) > 0 ? "occupied" : "available";
  return o.awaitingPayment || o.payments.length > 0 ? "awaiting" : "occupied";
}

export function canCloseBill(o: Order) {
  return o.status === "open" && isFullyPaid(o);
}

export function computeReports(s: PosState) {
  const closed = s.orders.filter((o) => o.status === "closed");
  const open = s.orders.filter((o) => o.status === "open");
  const allPayments = s.orders.flatMap((o) => o.payments);
  const sales = closed.reduce((t, o) => t + orderTotal(o), 0);
  const byMethod: Record<string, number> = {};
  const byCollector: Record<string, number> = {};
  let unverified = 0;
  for (const p of allPayments) {
    byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount;
    byCollector[p.collector] = (byCollector[p.collector] ?? 0) + p.amount;
    if (p.unverified) unverified += p.amount;
  }
  const itemCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const o of s.orders.filter((o) => o.status !== "cancelled"))
    for (const l of o.lines) {
      const c = (itemCounts[l.itemId] ??= { name: l.name, qty: 0, revenue: 0 });
      c.qty += l.qty; c.revenue += l.qty * l.price;
    }
  const topItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty).slice(0, 6);
  const waiters = s.staff.filter((x) => x.role === "waiter").map((w) => {
    const mine = s.orders.filter((o) => o.waiterId === w.id && o.status !== "cancelled");
    return {
      id: w.id, name: w.name,
      orders: mine.length,
      open: mine.filter((o) => o.status === "open").length,
      closed: mine.filter((o) => o.status === "closed").length,
      sales: mine.filter((o) => o.status === "closed").reduce((t, o) => t + orderTotal(o), 0),
    };
  });
  const unpaid = open.map((o) => ({ order: o, balance: orderBalance(o), total: orderTotal(o) }));
  return {
    sales, closedCount: closed.length, openCount: open.length,
    avgBill: closed.length ? sales / closed.length : 0,
    byMethod, byCollector, unverified, topItems, waiters, unpaid,
    unpaidTotal: unpaid.reduce((t, u) => t + u.balance, 0),
  };
}
