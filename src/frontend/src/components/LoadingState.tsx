import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function TableLoadingState({
  rows = 5,
  cols = 5,
}: { rows?: number; cols?: number }) {
  const rowKeys = Array.from({ length: rows }, (_, i) => `row-${i}`);
  const colKeys = Array.from({ length: cols }, (_, j) => `col-${j}`);
  return (
    <div data-ocid="table.loading_state" className="space-y-2">
      {rowKeys.map((rk) => (
        <div key={rk} className="flex gap-4">
          {colKeys.map((ck) => (
            <Skeleton key={ck} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardLoadingState() {
  const cardKeys = ["card-a", "card-b", "card-c", "card-d"];
  return (
    <div
      data-ocid="card.loading_state"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cardKeys.map((k) => (
        <div key={k} className="p-6 rounded-lg border bg-card space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      </div>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Memuat...</span>
    </div>
  );
}
