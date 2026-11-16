import { useEffect, useState } from "react";
import { AlertTriangle, Banknote, CheckCircle2, CreditCard, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { isUnverified, kes, orderBalance, orderPaid, orderTotal } from "@/lib/pos/logic";
import { staffName, tableName, usePos } from "@/lib/pos/store";
import type { Collector, Order, PayMethod } from "@/lib/pos/types";

const METHODS: { v: PayMethod; icon: typeof Banknote }[] = [
  { v: "Cash", icon: Banknote }, { v: "M-Pesa", icon: Smartphone }, { v: "Card", icon: CreditCard }, { v: "Other", icon: Wallet },
];

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; icon?: typeof Banknote }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-4 gap-2">
      {options.map(({ v, icon: Icon }) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={cn("flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm font-semibold transition",
            value === v ? "border-primary bg-accent text-accent-foreground ring-1 ring-primary" : "border-border bg-card hover:bg-secondary")}>
          {Icon && <Icon className="size-4" />}{v}
        </button>
      ))}
    </div>
  );
}

export function RecordPaymentDialog({ order, open, onOpenChange }: { order: Order; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { recordPayment, user } = usePos();
  const balance = orderBalance(order);
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [collector, setCollector] = useState<Collector>(user?.role === "manager" ? "Manager" : "Waiter");
  const [amount, setAmount] = useState(String(balance));
  const [reference, setReference] = useState(""); const [note, setNote] = useState("");
  useEffect(() => {
    if (open) { setAmount(String(balance)); setReference(""); setNote(""); setMethod("Cash"); setCollector(user?.role === "manager" ? "Manager" : "Waiter"); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const amt = Number(amount);
  const valid = amt > 0 && Number.isFinite(amt);
  const unverified = isUnverified(method, collector);
  const collectors: { v: Collector }[] = [{ v: "Waiter" }, { v: "Cashier" }, { v: "Manager" }];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record payment · Order #{order.number}</DialogTitle>
          <DialogDescription>Record money that was actually received. This app does not take payments or issue receipts — the cashier's own system issues the guest receipt.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
            <span className="text-muted-foreground">Balance due</span><span className="text-xl font-bold">{kes(balance)}</span>
          </div>
          <div className="space-y-1.5"><Label>Method</Label><Choice label="Payment method" value={method} options={METHODS} onChange={setMethod} /></div>
          <div className="space-y-1.5"><Label>Collected by</Label>
            <div className="[&>div]:grid-cols-3"><Choice label="Collected by" value={collector} options={collectors} onChange={setCollector} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amt">Amount (KES)</Label>
              <Input id="amt" inputMode="numeric" className="h-12 text-lg" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">Reference <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="ref" className="h-12" placeholder={method === "M-Pesa" ? "e.g. QK7A1B2C3" : "e.g. cashier slip no."} value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pnote">Note <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="pnote" className="h-12" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {unverified && (
            <p className="flex gap-2 rounded-lg bg-status-occupied-soft px-3 py-2 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-occupied" />
              Will be marked <b>&nbsp;manually recorded, not independently verified</b>. There is no payment or cashier integration.
            </p>
          )}
          {valid && amt > balance && balance > 0 && <p className="text-sm text-muted-foreground">Amount is above the balance by {kes(amt - balance)} (e.g. change or tip).</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="touch" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="touch" disabled={!valid} onClick={() => {
            recordPayment(order.id, { method, amount: amt, collector, reference: reference.trim(), note: note.trim() });
            toast.success(`${kes(amt)} ${method} recorded`, { description: amt >= balance ? "Bill is fully paid — you can close it now." : `Still due: ${kes(balance - amt)}` });
            onOpenChange(false);
          }}>Record {valid ? kes(amt) : "payment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CloseBillDialog({ order, open, onOpenChange, onClosed }: { order: Order; open: boolean; onOpenChange: (v: boolean) => void; onClosed?: () => void }) {
  const { closeBill, state } = usePos();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (open) setConfirm(false); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Close bill for {tableName(state, order.tableId)}?</DialogTitle>
          <DialogDescription>Closing frees the table. Closed bills can't be edited in this demo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg bg-secondary p-4 text-[15px]">
          <div className="flex justify-between"><span>Order total</span><b>{kes(orderTotal(order))}</b></div>
          <div className="flex justify-between"><span>Payments recorded</span><b>{kes(orderPaid(order))}</b></div>
          <ul className="border-t border-border pt-2 text-sm text-muted-foreground">
            {order.payments.map((p) => <li key={p.id}>{kes(p.amount)} · {p.method} · by {p.collector}{p.unverified ? " · not verified" : ""}</li>)}
          </ul>
        </div>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3">
          <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} className="size-6" />
          <span>I confirm the payment has actually been received.</span>
        </label>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="touch" onClick={() => onOpenChange(false)}>Keep open</Button>
          <Button size="touch" disabled={!confirm} onClick={() => {
            if (closeBill(order.id)) {
              toast.success(`Bill closed · ${tableName(state, order.tableId)} is available`, { description: `Closed by ${staffName(state, undefined) === "—" ? "you" : ""}`.trim() || undefined, icon: <CheckCircle2 className="size-4" /> });
              onOpenChange(false); onClosed?.();
            } else toast.warning("This bill isn't fully paid yet.");
          }}>Close bill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
