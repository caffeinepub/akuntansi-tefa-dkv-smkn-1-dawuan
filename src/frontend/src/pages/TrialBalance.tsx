import { CheckCircle2, Printer, XCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AccountTypeBadge } from "../components/AccountTypeBadge";
import { TableLoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PeriodSelector } from "../components/PeriodSelector";
import { PrintHeader } from "../components/PrintHeader";
import { usePeriods, useTrialBalance } from "../hooks/useQueries";
import { formatRupiah } from "../utils/format";

export function TrialBalance() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<bigint | null>(null);

  const { data: periods = [] } = usePeriods();
  const { data: entries = [], isLoading } = useTrialBalance(selectedPeriodId);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  const totalDebit = entries.reduce((s, e) => s + Number(e.totalDebit), 0);
  const totalKredit = entries.reduce((s, e) => s + Number(e.totalKredit), 0);
  const isBalanced = Math.abs(totalDebit - totalKredit) < 0.01;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 animate-fade-in">
      <PrintHeader title="NERACA SALDO" periodName={selectedPeriod?.name} />

      <PageHeader title="Neraca Saldo" subtitle="Ringkasan saldo semua akun">
        <div className="flex items-center gap-2 no-print">
          <PeriodSelector
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelect={setSelectedPeriodId}
            data-ocid="trial-balance.period.select"
          />
          <Button
            data-ocid="trial-balance.print.button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak
          </Button>
        </div>
      </PageHeader>

      {/* Balance status indicator */}
      {entries.length > 0 && (
        <div
          data-ocid={
            isBalanced
              ? "trial-balance.balanced.success_state"
              : "trial-balance.unbalanced.error_state"
          }
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium w-fit no-print ${
            isBalanced
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {isBalanced ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Neraca Saldo Seimbang
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" /> Neraca Saldo Tidak Seimbang
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableLoadingState rows={10} cols={4} />
          </div>
        ) : entries.length === 0 ? (
          <div
            data-ocid="trial-balance.empty_state"
            className="flex flex-col items-center justify-center py-16"
          >
            <p className="text-muted-foreground text-sm">
              Tidak ada data untuk ditampilkan
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wide">
                  Kode Akun
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Nama Akun
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide no-print">
                  Jenis
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">
                  Debit
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right pr-6">
                  Kredit
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow
                  key={entry.account.id.toString()}
                  data-ocid={`trial-balance.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-mono text-sm font-medium">
                    {entry.account.code}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.account.name}
                  </TableCell>
                  <TableCell className="no-print">
                    <AccountTypeBadge type={entry.account.accountType} />
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {Number(entry.totalDebit) > 0
                      ? formatRupiah(Number(entry.totalDebit))
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right pr-6 text-sm">
                    {Number(entry.totalKredit) > 0
                      ? formatRupiah(Number(entry.totalKredit))
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {/* Totals row */}
            <tfoot>
              <tr className="border-t-2 border-foreground/20 bg-muted/40 font-bold">
                <td className="pl-6 py-3 text-sm" colSpan={3}>
                  TOTAL
                </td>
                <td className="py-3 text-right text-sm pr-4">
                  {formatRupiah(totalDebit)}
                </td>
                <td className="py-3 text-right pr-6 text-sm">
                  {formatRupiah(totalKredit)}
                </td>
              </tr>
            </tfoot>
          </Table>
        )}
      </div>

      {/* Balance summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-4 no-print">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Total Debit</p>
            <p className="text-xl font-display font-bold">
              {formatRupiah(totalDebit)}
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Total Kredit</p>
            <p className="text-xl font-display font-bold">
              {formatRupiah(totalKredit)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
