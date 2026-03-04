import { Printer } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AccountType } from "../backend.d";
import { TableLoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PeriodSelector } from "../components/PeriodSelector";
import { PrintHeader } from "../components/PrintHeader";
import { useAccounts, useGeneralLedger, usePeriods } from "../hooks/useQueries";
import { formatDate, formatRupiah } from "../utils/format";

export function Ledger() {
  const [selectedAccountId, setSelectedAccountId] = useState<bigint | null>(
    null,
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<bigint | null>(null);

  const { data: accounts = [] } = useAccounts();
  const { data: periods = [] } = usePeriods();
  const { data: ledger, isLoading } = useGeneralLedger(
    selectedAccountId,
    selectedPeriodId,
  );

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  const activeAccounts = accounts
    .filter((a) => a.isActive)
    .sort((a, b) => a.code.localeCompare(b.code));

  const handlePrint = () => window.print();

  const typeOrder: Record<AccountType, number> = {
    [AccountType.Aset]: 0,
    [AccountType.Kewajiban]: 1,
    [AccountType.Modal]: 2,
    [AccountType.Pendapatan]: 3,
    [AccountType.Beban]: 4,
  };
  const sortedAccounts = [...activeAccounts].sort((a, b) => {
    const diff = typeOrder[a.accountType] - typeOrder[b.accountType];
    if (diff !== 0) return diff;
    return a.code.localeCompare(b.code);
  });

  const entries = ledger?.entries ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PrintHeader title="BUKU BESAR" periodName={selectedPeriod?.name} />

      <PageHeader title="Buku Besar" subtitle="Rincian transaksi per akun">
        <div className="flex items-center gap-2 no-print">
          <PeriodSelector
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelect={setSelectedPeriodId}
            data-ocid="ledger.period.select"
          />
          <Button
            data-ocid="ledger.print.button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak
          </Button>
        </div>
      </PageHeader>

      {/* Account Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="space-y-1.5 w-full sm:w-72 no-print">
          <label
            htmlFor="ledger-account-select"
            className="text-sm font-medium text-muted-foreground"
          >
            Pilih Akun
          </label>
          <Select
            value={selectedAccountId?.toString() ?? ""}
            onValueChange={(v) => setSelectedAccountId(BigInt(v))}
          >
            <SelectTrigger
              id="ledger-account-select"
              data-ocid="ledger.account.select"
            >
              <SelectValue placeholder="Pilih akun untuk melihat buku besar" />
            </SelectTrigger>
            <SelectContent>
              {sortedAccounts.map((a) => (
                <SelectItem key={a.id.toString()} value={a.id.toString()}>
                  {a.code} — {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAccount && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm">
              <span className="text-muted-foreground">Akun: </span>
              <span className="font-semibold">
                {selectedAccount.code} — {selectedAccount.name}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {selectedAccount.accountType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Saldo Normal: {selectedAccount.normalBalance}
            </Badge>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      {!selectedAccountId ? (
        <div
          data-ocid="ledger.empty_state"
          className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border"
        >
          <p className="text-muted-foreground text-sm">
            Pilih akun untuk menampilkan buku besar
          </p>
        </div>
      ) : isLoading ? (
        <div className="p-6 bg-card rounded-lg border">
          <TableLoadingState rows={5} cols={6} />
        </div>
      ) : entries.length === 0 ? (
        <div
          data-ocid="ledger.entries.empty_state"
          className="flex flex-col items-center justify-center py-16 bg-card rounded-lg border"
        >
          <p className="text-muted-foreground text-sm">
            Tidak ada transaksi untuk akun ini
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-card overflow-hidden">
          {/* Print header for account */}
          <div className="print-only px-6 pt-4 pb-2 border-b">
            <h3 className="font-bold text-base">
              {selectedAccount?.code} — {selectedAccount?.name}
            </h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wide">
                  Tanggal
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Keterangan
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  No. Bukti
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">
                  Debit
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">
                  Kredit
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right pr-6">
                  Saldo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => {
                const balance = Number(entry.balance);
                const isDebitBalance = balance >= 0;
                const entryKey = `${entry.date}-${entry.reference}-${idx}`;
                return (
                  <TableRow
                    key={entryKey}
                    data-ocid={`ledger.item.${idx + 1}`}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="pl-6 text-sm">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {entry.reference}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {Number(entry.debit) > 0
                        ? formatRupiah(Number(entry.debit))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {Number(entry.kredit) > 0
                        ? formatRupiah(Number(entry.kredit))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right pr-6 text-sm font-semibold">
                      <span
                        className={
                          isDebitBalance
                            ? "text-foreground"
                            : "text-destructive"
                        }
                      >
                        {formatRupiah(Math.abs(balance))}
                        {!isDebitBalance && " (K)"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="bg-muted/30 border-t px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Saldo Akhir</span>
            <span className="text-base font-bold text-primary">
              {formatRupiah(
                Math.abs(
                  Number(entries[entries.length - 1]?.balance ?? BigInt(0)),
                ),
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
