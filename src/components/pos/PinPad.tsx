import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

export function PinDots({ length, error }: { length: number; error?: boolean }) {
  return (
    <div className={cn("flex justify-center gap-3", error && "animate-shake")} aria-live="polite" aria-label={`${length} of 6 digits entered`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className={cn("size-4 rounded-full border-2 transition-colors",
          error ? "border-destructive bg-destructive/20" : i < length ? "border-primary bg-primary" : "border-input")} />
      ))}
    </div>
  );
}

export function PinPad({ onDigit, onBack, onClear }: { onDigit: (d: string) => void; onBack: () => void; onClear: () => void }) {
  const key = "h-16 rounded-xl bg-card border border-border text-2xl font-semibold shadow-sm active:scale-[0.97] active:bg-secondary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button key={d} type="button" className={key} onClick={() => onDigit(d)}>{d}</button>
      ))}
      <button type="button" className={cn(key, "text-base text-muted-foreground")} onClick={onClear}>Clear</button>
      <button type="button" className={key} onClick={() => onDigit("0")}>0</button>
      <button type="button" className={cn(key, "grid place-items-center")} onClick={onBack} aria-label="Delete last digit"><Delete className="size-6" /></button>
    </div>
  );
}
