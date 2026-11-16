import { ChefHat, Printer, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { staffName, tableName, usePos } from "@/lib/pos/store";
import type { Ticket } from "@/lib/pos/types";

export function TicketPaper({ ticket }: { ticket: Ticket }) {
  const { state } = usePos();
  const d = new Date(ticket.createdAt);
  return (
    <div className="kitchen-print-area mx-auto w-full max-w-[320px] rounded-md border border-dashed border-input bg-card px-5 py-4 font-mono text-[13px] text-foreground shadow-sm">
      <div className="text-center">
        <p className="text-xs tracking-widest">SORIN HOTEL · KITCHEN</p>
        <p className="mt-1 text-lg font-bold">{ticket.kind === "addition" ? "*** ADDITION ***" : "NEW ORDER"}</p>
        <p className="text-[11px]">DEMO — NOT A CUSTOMER RECEIPT</p>
      </div>
      <div className="my-3 border-t border-dashed border-input" />
      <div className="grid grid-cols-2 gap-y-0.5">
        <span>Ticket</span><span className="text-right">#{ticket.number}</span>
        <span>Order</span><span className="text-right">#{ticket.orderNumber}</span>
        <span className="font-bold">{tableName(state, ticket.tableId)}</span><span className="text-right">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span>Waiter</span><span className="text-right">{staffName(state, ticket.waiterId)}</span>
        <span>Date</span><span className="text-right">{d.toLocaleDateString()}</span>
      </div>
      <div className="my-3 border-t border-dashed border-input" />
      <ul className="space-y-2">
        {ticket.items.map((it, i) => (
          <li key={i}>
            <div className="flex gap-3 text-[15px] font-bold"><span className="w-8">{it.qty}×</span><span className="flex-1">{it.name}</span></div>
            {it.note && <p className="pl-11 text-[13px]">» {it.note}</p>}
          </li>
        ))}
      </ul>
      <div className="my-3 border-t border-dashed border-input" />
      <p className="text-center text-[11px]">POS-01 · Demo · items {ticket.items.reduce((s, i) => s + i.qty, 0)}</p>
    </div>
  );
}

export function KitchenTicketDialog({ ticket, onOpenChange }: { ticket: Ticket | null; onOpenChange: (v: boolean) => void }) {
  const { markPrinted } = usePos();
  if (!ticket) return null;
  return (
    <Dialog open={!!ticket} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center gap-2"><ChefHat className="size-5 text-primary" />Kitchen ticket #{ticket.number}</DialogTitle>
          <DialogDescription>
            Simulation only — no kitchen printer is connected. This ticket goes to the kitchen, never to the guest.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-auto rounded-lg bg-secondary p-3"><TicketPaper ticket={ticket} /></div>
        <div className="no-print grid grid-cols-2 gap-2">
          <Button variant="outline" size="touch" onClick={() => { window.print(); }}>
            <Printer /> Browser print
          </Button>
          <Button size="touch" onClick={() => { markPrinted(ticket.id); toast.success(`Ticket #${ticket.number} marked as printed (simulated)`); onOpenChange(false); }}>
            <FlaskConical /> Simulate kitchen print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
