import type { MenuItem, Order, PosState, Staff, Table, Ticket } from "./types";

export const DEMO_STAFF: Staff[] = [
  { id: "s-alice", name: "Alice Wanjiru", role: "waiter", pin: "123456", active: true },
  { id: "s-brian", name: "Brian Otieno", role: "waiter", pin: "234567", active: true },
  { id: "s-peter", name: "Peter Kamau", role: "waiter", pin: "345678", active: true },
  { id: "s-grace", name: "Grace Muthoni", role: "manager", pin: "987654", active: true },
];

const m = (id: string, name: string, category: MenuItem["category"], price: number, emoji: string, desc: string): MenuItem =>
  ({ id, name, category, price, emoji, desc, available: true });

export const DEMO_MENU: MenuItem[] = [
  m("m-mandazi", "Mandazi (4 pcs)", "Breakfast & Snacks", 100, "🥯", "Lightly sweet coconut fried dough"),
  m("m-samosa", "Beef Samosa (2 pcs)", "Breakfast & Snacks", 150, "🥟", "Crisp pastry, spiced minced beef"),
  m("m-chapati", "Chapati", "Breakfast & Snacks", 50, "🫓", "Soft layered flatbread"),
  m("m-breakfast", "Full Kenyan Breakfast", "Breakfast & Snacks", 650, "🍳", "Eggs, sausage, toast, beans, tea"),
  m("m-smokie", "Smokie Pasua", "Breakfast & Snacks", 80, "🌭", "Smokie with kachumbari"),
  m("m-chai", "Kenyan Chai", "Drinks", 120, "🫖", "Spiced milk tea"),
  m("m-coffee", "Black Coffee", "Drinks", 150, "☕", "Kenyan AA filter coffee"),
  m("m-soda", "Soda 330ml", "Drinks", 100, "🥤", "Assorted, chilled"),
  m("m-water", "Mineral Water 500ml", "Drinks", 80, "💧", "Still"),
  m("m-dawa", "Dawa", "Drinks", 250, "🍋", "Hot ginger, lemon and honey"),
  m("m-choma", "Nyama Choma (½ kg)", "Main Dishes", 900, "🍖", "Grilled goat, kachumbari, ugali"),
  m("m-chicken", "Chicken Stew & Ugali", "Main Dishes", 750, "🍗", "Kienyeji-style stew"),
  m("m-pilau", "Beef Pilau", "Main Dishes", 650, "🍛", "Spiced rice with beef"),
  m("m-tilapia", "Tilapia Fry & Ugali", "Main Dishes", 950, "🐟", "Whole fried fish, sukuma"),
  m("m-githeri", "Githeri", "Main Dishes", 400, "🫘", "Maize and beans stew"),
  m("m-sukuma", "Sukuma & Ugali", "Main Dishes", 300, "🥬", "Sautéed greens, ugali"),
  m("m-passion", "Passion Juice", "Fresh Juices & Fruit", 250, "🧃", "Fresh, 400ml"),
  m("m-mango", "Mango Juice", "Fresh Juices & Fruit", 250, "🥭", "Fresh, 400ml"),
  m("m-fruit", "Fruit Platter", "Fresh Juices & Fruit", 350, "🍉", "Seasonal cut fruit"),
  m("m-masala", "Masala Fries", "Fries", 350, "🍟", "Fries tossed in masala sauce"),
  m("m-chips", "Plain Chips", "Fries", 250, "🍟", "Salted, with ketchup"),
  m("m-mayai", "Chips Mayai", "Fries", 400, "🥚", "Chips omelette"),
  m("m-bone", "Bone Broth Soup", "Soups", 300, "🍲", "Slow-simmered beef broth"),
  m("m-vegsoup", "Vegetable Soup", "Soups", 250, "🥣", "Seasonal vegetables"),
  m("m-yog", "Plain Yoghurt", "Yoghurt", 200, "🥛", "Thick, lightly sweet"),
  m("m-yogmango", "Mango Yoghurt", "Yoghurt", 250, "🍨", "With mango pulp"),
];

export const DEMO_TABLES: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `t-${String(i + 1).padStart(2, "0")}`,
  name: `Table ${String(i + 1).padStart(2, "0")}`,
  seats: [2, 4, 4, 4, 6, 2, 4, 8, 4, 2][i],
}));

/** Built lazily (never at module scope) so timestamps are relative to "now". */
export function makeSeed(now: number): PosState {
  const menuById = Object.fromEntries(DEMO_MENU.map((x) => [x.id, x]));
  const orders: Order[] = [];
  const tickets: Ticket[] = [];
  let orderNo = 1000, ticketNo = 5000, id = 1;
  const mk = (
    tableId: string, waiterId: string, minsAgo: number, items: [string, number, string?][],
    opts: { closed?: { method: Order["payments"][0]["method"]; collector: Order["payments"][0]["collector"]; minsAgo: number }; awaiting?: boolean; partial?: number } = {},
  ) => {
    const createdAt = now - minsAgo * 60000;
    const order: Order = {
      id: `o-${++orderNo}`, number: orderNo, tableId, waiterId, status: "open", awaitingPayment: !!opts.awaiting,
      createdAt, lines: [], payments: [],
    };
    const t: Ticket = {
      id: `k-${++ticketNo}`, number: ticketNo, orderId: order.id, orderNumber: order.number, tableId, waiterId,
      createdAt, kind: "initial", items: [], status: "printed", printCount: 1,
    };
    for (const [itemId, qty, note = ""] of items) {
      const mi = menuById[itemId];
      order.lines.push({ id: `l-${id++}`, itemId, name: mi.name, price: mi.price, qty, note, ticketId: t.id, sentAt: createdAt });
      t.items.push({ name: mi.name, qty, note });
    }
    const total = order.lines.reduce((s, l) => s + l.price * l.qty, 0);
    if (opts.closed) {
      const at = now - opts.closed.minsAgo * 60000;
      order.payments.push({
        id: `p-${id++}`, method: opts.closed.method, amount: total, collector: opts.closed.collector,
        reference: opts.closed.method === "M-Pesa" ? "QK" + (7000000 + id) : "", note: "", at,
        recordedById: waiterId, unverified: opts.closed.collector === "Cashier" || opts.closed.method !== "Cash",
      });
      order.status = "closed"; order.closedAt = at; order.closedById = waiterId;
    }
    if (opts.partial) {
      order.payments.push({
        id: `p-${id++}`, method: "Cash", amount: opts.partial, collector: "Waiter", reference: "", note: "Part payment, guest 1",
        at: now - 5 * 60000, recordedById: waiterId, unverified: false,
      });
    }
    orders.push(order); tickets.push(t);
  };
  // Closed, paid bills earlier in the shift
  mk("t-01", "s-alice", 320, [["m-breakfast", 2], ["m-chai", 2]], { closed: { method: "Cash", collector: "Waiter", minsAgo: 280 } });
  mk("t-03", "s-brian", 300, [["m-mandazi", 2], ["m-coffee", 2], ["m-samosa", 1]], { closed: { method: "M-Pesa", collector: "Waiter", minsAgo: 270 } });
  mk("t-05", "s-peter", 240, [["m-choma", 2], ["m-soda", 4], ["m-chips", 2]], { closed: { method: "Card", collector: "Cashier", minsAgo: 190 } });
  mk("t-08", "s-alice", 200, [["m-pilau", 3], ["m-passion", 3], ["m-fruit", 1]], { closed: { method: "M-Pesa", collector: "Cashier", minsAgo: 150 } });
  mk("t-06", "s-brian", 150, [["m-tilapia", 1], ["m-water", 2]], { closed: { method: "Cash", collector: "Manager", minsAgo: 110 } });
  mk("t-02", "s-alice", 120, [["m-masala", 2], ["m-soda", 2], ["m-chicken", 1]], { closed: { method: "Cash", collector: "Waiter", minsAgo: 80 } });
  // In-progress
  mk("t-02", "s-brian", 25, [["m-chicken", 2, "One without chilli"], ["m-mango", 2]]);
  mk("t-07", "s-alice", 55, [["m-choma", 1], ["m-chapati", 4], ["m-soda", 3]], { awaiting: true, partial: 600 });
  mk("t-09", "s-peter", 12, [["m-bone", 2], ["m-dawa", 2, "Extra honey"]]);
  return {
    version: 1, staff: DEMO_STAFF, menu: DEMO_MENU, tables: DEMO_TABLES, orders, tickets, drafts: {},
    seq: { order: orderNo, ticket: ticketNo, id: id + 100 },
  };
}
