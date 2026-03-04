import { CheckCircle2, Printer, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import { useBalanceSheet, usePeriods } from "../hooks/useQueries";
import { formatRupiah } from "../utils/format";

export function BalanceSheet() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<bigint | null>(null);

  const { data: periods = [] } = usePeriods();
  const { data: sheet, isLoading } = useBalanceSheet(selectedPeriodId);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  const asetDetails =
    sheet?.details.filter((d) => d.account.accountType === AccountType.Aset) ??
    [];
  const kewajibanDetails =
    sheet?.details.filter(
      (d) => d.account.accountType === AccountType.Kewajiban,
    ) ?? [];
  const modalDetails =
    sheet?.details.filter((d) => d.account.accountType === AccountType.Modal) ??
    [];

  const totalAset = Number(sheet?.totalAset ?? BigInt(0));
  const totalKewajiban = Number(sheet?.totalKewajiban ?? BigInt(0));
  const totalModal = Number(sheet?.totalModal ?? BigInt(0));
  const totalKewajibanModal = totalKewajiban + totalModal;
  const isBalanced = Math.abs(totalAset - totalKewajibanModal) < 1;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 animate-fade-in">
      <PrintHeader title="NERACA" periodName={selectedPeriod?.name} />

      <PageHeader title="Neraca" subtitle="Posisi keuangan Teaching Factory">
        <div className="flex items-center gap-2 no-print">
          <PeriodSelector
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelect={setSelectedPeriodId}
            data-ocid="balance-sheet.period.select"
          />
          <Button
            data-ocid="balance-sheet.print.button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak
          </Button>
        </div>
      </PageHeader>

      {/* Balance indicator */}
      {sheet && (
        <div
          data-ocid={
            isBalanced
              ? "balance-sheet.balanced.success_state"
              : "balance-sheet.unbalanced.error_state"
          }
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium w-fit no-print ${
            isBalanced
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {isBalanced ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Neraca Seimbang
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" /> Neraca Tidak Seimbang
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="p-6 bg-card rounded-lg border">
          <TableLoadingState rows={10} cols={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ASET */}
          <div className="rounded-lg border bg-card shadow-card overflow-hidden">
            <div className="bg-blue-600 px-6 py-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                ASET
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50/50 hover:bg-blue-50/50">
                  <TableHead className="pl-6 text-xs font-semibold">
                    Nama Akun
                  </TableHead>
                  <TableHead className="text-right pr-6 text-xs font-semibold">
                    Jumlah
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asetDetails.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="pl-6 text-sm text-muted-foreground"
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  asetDetails.map((d, idx) => (
                    <TableRow
                      key={d.account.id.toString()}
                      data-ocid={`balance-sheet.aset.item.${idx + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 text-sm">
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
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
              </TableBody>
              <tfoot>
                <tr className="bg-blue-100/60 border-t-2 border-blue-200">
                  <td className="pl-6 py-3 text-sm font-bold text-blue-800">
                    Total Aset
                  </td>
                  <td className="pr-6 py-3 text-right text-sm font-bold text-blue-800">
                    {formatRupiah(totalAset)}
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>

          {/* KEWAJIBAN + MODAL */}
          <div className="space-y-4">
            {/* Kewajiban */}
            <div className="rounded-lg border bg-card shadow-card overflow-hidden">
              <div className="bg-red-600 px-6 py-3">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  KEWAJIBAN
                </h3>
              </div>
              <Table>
                <TableBody>
                  {kewajibanDetails.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="pl-6 text-sm text-muted-foreground"
                      >
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    kewajibanDetails.map((d, idx) => (
                      <TableRow
                        key={d.account.id.toString()}
                        data-ocid={`balance-sheet.kewajiban.item.${idx + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="pl-6 text-sm">
                          <span className="text-muted-foreground mr-2 font-mono text-xs">
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
                </TableBody>
                <tfoot>
                  <tr className="bg-red-50/60 border-t-2 border-red-200">
                    <td className="pl-6 py-3 text-sm font-bold text-red-700">
                      Total Kewajiban
                    </td>
                    <td className="pr-6 py-3 text-right text-sm font-bold text-red-700">
                      {formatRupiah(totalKewajiban)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>

            {/* Modal */}
            <div className="rounded-lg border bg-card shadow-card overflow-hidden">
              <div className="bg-green-700 px-6 py-3">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  MODAL
                </h3>
              </div>
              <Table>
                <TableBody>
                  {modalDetails.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="pl-6 text-sm text-muted-foreground"
                      >
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    modalDetails.map((d, idx) => (
                      <TableRow
                        key={d.account.id.toString()}
                        data-ocid={`balance-sheet.modal.item.${idx + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="pl-6 text-sm">
                          <span className="text-muted-foreground mr-2 font-mono text-xs">
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
                </TableBody>
                <tfoot>
                  <tr className="bg-green-50/60 border-t-2 border-green-200">
                    <td className="pl-6 py-3 text-sm font-bold text-green-700">
                      Total Modal
                    </td>
                    <td className="pr-6 py-3 text-right text-sm font-bold text-green-700">
                      {formatRupiah(totalModal)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>

            {/* Grand Total Kewajiban + Modal */}
            <div
              className={`p-4 rounded-lg border-2 ${isBalanced ? "border-blue-300 bg-blue-50" : "border-red-300 bg-red-50"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  Total Kewajiban + Modal
                </span>
                <span className="font-bold text-base">
                  {formatRupiah(totalKewajibanModal)}
                </span>
              </div>
              {!isBalanced && (
                <p className="text-xs text-red-600 mt-1">
                  Selisih:{" "}
                  {formatRupiah(Math.abs(totalAset - totalKewajibanModal))}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
