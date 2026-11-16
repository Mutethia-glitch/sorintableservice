# Sorin Table Service

Create a NEW Lovable project called "Sorin Hotel POS — Prototype". Build a polished, genuinely interactive, front-end-only prototype of a NEW restaurant point-of-sale application for Sorin Hotel, designed primarily for existing WINDOWS touchscreen POS terminals. This is NOT an update of existing software. Its audience is busy nontechnical waiters and a manager/admin. Make it SIMPLE, FAST, PROFESSIONAL, calm and approachable, like a modern production hospitality POS, without visual clutter. Optimize for landscape touchscreen at 1366x768 and 1024x768, scaling to laptops. Use React, TypeScript, Tailwind, shadcn/ui, lucid icons. Keep subtle colors: cream/white, ink/charcoal, muted sage/emerald accent, restrained status colors, high contrast. Large tap targets >=44px; large text, clear back/close controls, maximum 2-3 taps for most common actions.

IMPORTANT: this is a DEMONSTRATION with local mock sample data and local UI persistence only (localStorage or similar), no real server, cloud database, authentication security promises, payment gateway, external cashier system, or kitchen hardware integrations. Do not connect any real systems. All data fake; label prototype clearly in settings/footer. Simulate workflows completely, not inert buttons or a static mockup. No room management, check-in/out, room billing, hotel reception, separate cashier workspace, customer receipt generation/printing, or guest management.

KNOWN HOTEL WORKFLOW:
- Waiter asks diners what they want, uses PIN to access own account instantly, selects/open table, adds menu items/quantities/special instructions, sends kitchen order ticket ONLY to kitchen printer, then can add more items later (print delta only).
- Multiple waiters each have unique 6-digit PINs and distinct accounts. Manager/admin also uses a PIN. For demo use unique clearly fictional PINs, e.g. Alice waiter 123456, Brian waiter 234567, manager 987654. Expose these only via a discreet "Try demo account" panel on sign-in. A PIN match instantly routes to corresponding UI. Provide PIN keypad and physical keyboard support, sign out/switch accounts, and no one can sign in by PIN into the wrong demo account. Keep state keyed to user session, not global 'current user' across tabs if possible; do not claim this demo enforces production isolation.
- Cashier uses THEIR OWN SEPARATE EXISTING system, NOT ours. Cashier and waiter can collect payments; earlier management also permitted. The ONLY CUSTOMER PAYMENT RECEIPT is issued by cashier via their external system; our app must not issue or print customer receipts. Waiter closes bill once payment is actually received. We only record payment method, amount, collector (Waiter / Cashier / Manager), reference/notes optional, timestamp, and closeout actor. Mark it "manually recorded, not independently verified" if payment was via cashier or electronic and no gateway integration. Never imply integration/verification. If not fully paid, keep bill open. Clear intentional confirmation before Close Bill. If status paid in mock data, reflect accurately.
- Only kitchen ORDER TICKETS are printed by our POS. Provide a realistic kitchen ticket modal and "Simulate kitchen print" / browser-print ONLY for kitchen ticket via print-specific CSS. On sending order, create kitchen ticket with order/table/time/waiter/menu items/qty/instructions; duplicate-click protection; show sent status; new additions create tickets only for newly added items. Include a "Kitchen Tickets" queue/status page or tab (Sent/Queued/Reprint) but no fictional production kitchen integration. We can simulate printing by marking as printed and offering print preview. No customer receipt UI ever.
- Manager/admin dashboard can view sample sales reports, payment breakdowns, number of open orders, closed bills, top menu items, waiter activity, unpaid bills. Reports derive from the mock orders/payments as state changes. Manager can view staff and menu admin overview (can be light functional CRUD, e.g. toggle availability and edit item price). Manager can also collect/record payments if needed. Waiters should see only waiter functions and own order attribution while working; users can still see shared table occupancy/other waiter names and require manager confirmation for destructive actions.
- Core sample workflow includes table grid (Available/Occupied/Awaiting payment), waiter open/create table order, searchable food photo/category tiles with familiar categories "Breakfast & Snacks", "Drinks", "Main Dishes", "Fresh Juices & Fruit", "Fries", "Soups", "Yoghurt"; sample realistic Kenyan-style menu entries and KES pricing clearly labeled demo data; cart with +/- controls, notes, send order, currently ordered items and running total; reopen table; add items; payment record and close; order history. Make meaningful demo images via safe stable assets or attractive simple illustrations with good fallbacks, don't depend on external images when interacting.
- UI structure: Minimal Login PIN screen; after login top bar with "Sorin Hotel", logged-in staff, role, terminal name "POS-01 · Demo", current date/time, sign out; sidebar or compact nav: Tables, New Order / Menu, My Orders, Kitchen Tickets, Payments / Open Bills; manager additionally Reports and Settings/Team. Start at Tables rather than dashboard for waiters. Quick status overview across top, filter table statuses, simple breadcrumbs and strong CTA.
- Seed ~10 tables, ~20 menu items, a couple of realistic in-progress mock orders and paid orders so manager reports look good. All interactive changes stay consistent; reload persistence is nice.
- Polished empty states, loading not necessary, toast successes, user-friendly warnings, no errors, smooth focus, accessible labels. Show a brief simple usage hint once per relevant screen.
- Security note in a small prototype info panel: production needs server-side hashed PINs with unique lookup, device-bound sessions, attempt limits, role enforcement, audit trail, idempotent sync/queue, local server/offline behavior; these are NOT implemented in front-end demo. Do NOT represent these as complete.
- Print ONLY kitchen tickets using browser print stylesheet or simple simulation. Since no real printers attached, label the process clearly as a simulation.

GOAL: A compact but convincing REAL CLICKABLE prototype where a user can: enter a unique demo PIN, open Table 04, add two food/drink items, send kitchen ticket, add another item with separate kitchen ticket, record payment (collected by waiter/cashier/manager), close bill, log in as manager, and see updated reports. Ensure all navigation and major controls work, with no placeholder dead ends.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b6a10fa0-b599-4296-9a4f-10b7c85a73b7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
