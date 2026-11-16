import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos/store";
import { PinDots, PinPad } from "./PinPad";

export function ManagerPinDialog({ open, onOpenChange, title, description, onConfirmed }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string; onConfirmed: (managerName: string) => void;
}) {
  const { verifyManager } = usePos();
  const [pin, setPin] = useState(""); const [err, setErr] = useState(false);
  useEffect(() => { if (open) { setPin(""); setErr(false); } }, [open]);
  const push = (d: string) => {
    if (pin.length >= 6) return;
    const next = pin + d; setErr(false); setPin(next);
    if (next.length === 6) {
      const m = verifyManager(next);
      if (m) { onConfirmed(m.name); onOpenChange(false); } else { setErr(true); setTimeout(() => setPin(""), 350); }
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" onKeyDown={(e) => {
        if (/^\d$/.test(e.key)) push(e.key); else if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" />{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <PinDots length={pin.length} error={err} />
          {err && <p className="text-center text-sm text-destructive">That is not a manager PIN.</p>}
          <PinPad onDigit={push} onBack={() => setPin((p) => p.slice(0, -1))} onClear={() => setPin("")} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
