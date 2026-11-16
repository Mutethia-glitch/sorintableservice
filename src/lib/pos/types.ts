export type Role = "waiter" | "manager";
export interface Staff { id: string; name: string; role: Role; pin: string; active: boolean }
export const CATEGORIES = [
  "Breakfast & Snacks", "Drinks", "Main Dishes", "Fresh Juices & Fruit", "Fries", "Soups", "Yoghurt",
] as const;
export type Category = (typeof CATEGORIES)[number];
export interface MenuItem { id: string; name: string; category: Category; price: number; emoji: string; desc: string; available: boolean }
export interface Table { id: string; name: string; seats: number }
export interface DraftLine { id: string; itemId: string; qty: number; note: string }
export interface OrderLine { id: string; itemId: string; name: string; price: number; qty: number; note: string; ticketId: string; sentAt: number }
export type PayMethod = "Cash" | "M-Pesa" | "Card" | "Other";
export type Collector = "Waiter" | "Cashier" | "Manager";
export interface Payment {
  id: string; method: PayMethod; amount: number; collector: Collector; reference: string; note: string;
  at: number; recordedById: string; unverified: boolean;
}
export interface Order {
  id: string; number: number; tableId: string; waiterId: string; status: "open" | "closed" | "cancelled";
  awaitingPayment: boolean; createdAt: number; closedAt?: number; closedById?: string;
  lines: OrderLine[]; payments: Payment[];
}
export interface Ticket {
  id: string; number: number; orderId: string; orderNumber: number; tableId: string; waiterId: string;
  createdAt: number; kind: "initial" | "addition"; items: { name: string; qty: number; note: string }[];
  status: "queued" | "printed"; printCount: number;
}
export interface PosState {
  version: number; staff: Staff[]; menu: MenuItem[]; tables: Table[]; orders: Order[]; tickets: Ticket[];
  drafts: Record<string, DraftLine[]>; seq: { order: number; ticket: number; id: number };
}
export type TableStatus = "available" | "occupied" | "awaiting";
