import { cn } from "@/lib/utils";
import type { TableStatus } from "@/lib/pos/types";

export const STATUS_LABEL: Record<TableStatus, string> = { available: "Available", occupied: "Occupied", awaiting: "Awaiting payment" };
export const statusStyles: Record<TableStatus, { soft: string; dot: string; border: string }> = {
  available: { soft: "bg-status-available-soft text-status-available", dot: "bg-status-available", border: "border-status-available/30" },
  occupied: { soft: "bg-status-occupied-soft text-status-occupied", dot: "bg-status-occupied", border: "border-status-occupied/40" },
  awaiting: { soft: "bg-status-awaiting-soft text-status-awaiting", dot: "bg-status-awaiting", border: "border-status-awaiting/40" },
};
export function StatusBadge({ status, className }: { status: TableStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[status].soft, className)}>
      <span className={cn("size-2 rounded-full", statusStyles[status].dot)} />
      {STATUS_LABEL[status]}
    </span>
  );
}
