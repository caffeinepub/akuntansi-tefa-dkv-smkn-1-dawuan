import { DollarSign, Printer, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { useIncomeStatement, usePeriods } from "../hooks/useQueries";
import { formatRupiah } from "../utils/format";

export function IncomeStatement() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<bigint | null>(null);

  const { data: periods = [] } = usePeriods();
  const { data: statement, isLoading } = useIncomeStatement(selectedPeriodId);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  const pendapatanDetails =
    statement?.details.filter(
      (d) => d.account.accountType === AccountType.Pendapatan,
    ) ?? [];
  const bebanDetails =
    statement?.details.filter(
      (d) => d.account.accountType === AccountType.Beban,
    ) ?? [];

  const totalPendapatan = Number(statement?.totalPendapatan ?? BigInt(0));
  const totalBeban = Number(statement?.totalBeban ?? BigInt(0));
  const labaRugi = Number(statement?.labaRugi ?? BigInt(0));
  const isProfit = labaRugi >= 0;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 animate-fade-in">
      <PrintHeader
        title="LAPORAN LABA RUGI"
        periodName={selectedPeriod?.name}
      />

      <PageHeader
        title="Laporan Laba Rugi"
        subtitle="Pendapatan dan beban periode akuntansi"
      >
        <div className="flex items-center gap-2 no-print">
          <PeriodSelector
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelect={setSelectedPeriodId}
            data-ocid="income-statement.period.select"
          />
          <Button
            data-ocid="income-statement.print.button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="p-6 bg-card rounded-lg border">
          <TableLoadingState rows={8} cols={2} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
            <div className="p-5 rounded-lg border bg-card shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Pendapatan
                </p>
              </div>
              <p className="text-xl font-display font-bold text-green-700">
                {formatRupiah(totalPendapatan)}
              </p>
            </div>
            <div className="p-5 rounded-lg border bg-card shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-sm text-muted-foreground">Total Beban</p>
              </div>
              <p className="text-xl font-display font-bold text-orange-700">
                {formatRupiah(totalBeban)}
              </p>
            </div>
            <div
              className={`p-5 rounded-lg border shadow-card ${isProfit ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${isProfit ? "bg-green-100" : "bg-red-100"}`}
                >
                  <DollarSign
                    className={`w-4 h-4 ${isProfit ? "text-green-600" : "text-red-600"}`}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Laba/Rugi Bersih
                </p>
              </div>
              <p
                className={`text-xl font-display font-bold ${isProfit ? "text-green-800" : "text-red-800"}`}
              >
                {isProfit ? "" : "(−) "}
                {formatRupiah(Math.abs(labaRugi))}
              </p>
              <p
                className="text-xs mt-1 font-medium"
                style={{
                  color: isProfit ? "oklch(0.5 0.2 145)" : "oklch(0.5 0.2 15)",
                }}
              >
                {isProfit ? "Laba Bersih" : "Rugi Bersih"}
              </p>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="rounded-lg border bg-card shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wide">
                    Keterangan
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-right pr-6">
                    Jumlah
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Pendapatan Section */}
                <TableRow className="bg-green-50/50 hover:bg-green-50">
                  <TableCell
                    className="pl-6 font-semibold text-sm text-green-800"
                    colSpan={2}
                  >
                    I. PENDAPATAN
                  </TableCell>
                </TableRow>
                {pendapatanDetails.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="pl-10 text-sm text-muted-foreground"
                      colSpan={2}
                    >
                      Tidak ada data pendapatan
                    </TableCell>
                  </TableRow>
                ) : (
                  pendapatanDetails.map((d, idx) => (
                    <TableRow
                      key={d.account.id.toString()}
                      data-ocid={`income-statement.pendapatan.item.${idx + 1}`}
                      className="hover:bg-muted/20"
                    >
                      <TableCell className="pl-10 text-sm">
                        <span className="text-muted-foreground mr-2 font-mono">
                          {d.account.code}
                        </span>
                        {d.account.name}
                      </TableCell>
                      <TableCell className="text-right pr-6 text-sm">
                        {formatRupiah(Number(d.amount))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-green-100/50 hover:bg-green-100/50">
                  <TableCell className="pl-6 text-sm font-bold text-green-800">
                    Total Pendapatan
                  </TableCell>
                  <TableCell className="text-right pr-6 text-sm font-bold text-green-800">
                    {formatRupiah(totalPendapatan)}
                  </TableCell>
                </TableRow>

                {/* Spacer */}
                <TableRow className="h-2 hover:bg-transparent">
                  <TableCell colSpan={2} className="p-0" />
                </TableRow>

                {/* Beban Section */}
                <TableRow className="bg-orange-50/50 hover:bg-orange-50">
                  <TableCell
                    className="pl-6 font-semibold text-sm text-orange-800"
                    colSpan={2}
                  >
                    II. BEBAN
                  </TableCell>
                </TableRow>
                {bebanDetails.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="pl-10 text-sm text-muted-foreground"
                      colSpan={2}
                    >
                      Tidak ada data beban
                    </TableCell>
                  </TableRow>
                ) : (
                  bebanDetails.map((d, idx) => (
                    <TableRow
                      key={d.account.id.toString()}
                      data-ocid={`income-statement.beban.item.${idx + 1}`}
                      className="hover:bg-muted/20"
                    >
                      <TableCell className="pl-10 text-sm">
                        <span className="text-muted-foreground mr-2 font-mono">
                          {d.account.code}
                        </span>
                        {d.account.name}
                      </TableCell>
                      <TableCell className="text-right pr-6 text-sm">
                        {formatRupiah(Number(d.amount))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-orange-100/50 hover:bg-orange-100/50">
                  <TableCell className="pl-6 text-sm font-bold text-orange-800">
                    Total Beban
                  </TableCell>
                  <TableCell className="text-right pr-6 text-sm font-bold text-orange-800">
                    {formatRupiah(totalBeban)}
                  </TableCell>
                </TableRow>

                {/* Spacer */}
                <TableRow className="h-2 hover:bg-transparent">
                  <TableCell colSpan={2} className="p-0" />
                </TableRow>

                {/* Net Income */}
                <TableRow
                  className={`border-t-2 ${isProfit ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"} hover:bg-opacity-80`}
                >
                  <TableCell
                    className={`pl-6 text-base font-bold ${isProfit ? "text-green-800" : "text-red-800"}`}
                  >
                    {isProfit ? "LABA BERSIH" : "RUGI BERSIH"}
                  </TableCell>
                  <TableCell
                    className={`text-right pr-6 text-base font-bold ${isProfit ? "text-green-800" : "text-red-800"}`}
                  >
                    {formatRupiah(Math.abs(labaRugi))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
