import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Database,
  DollarSign,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import {
  CardLoadingState,
  TableLoadingState,
} from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PeriodSelector } from "../components/PeriodSelector";
import {
  useBalanceSheet,
  useIncomeStatement,
  useJournalEntries,
  usePeriods,
  useSeedData,
} from "../hooks/useQueries";
import { formatDate, formatRupiah } from "../utils/format";

export function Dashboard() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<bigint | null>(null);

  const { data: periods = [], isLoading: periodsLoading } = usePeriods();
  const { data: balanceSheet, isLoading: bsLoading } =
    useBalanceSheet(selectedPeriodId);
  const { data: incomeStatement, isLoading } =
    useIncomeStatement(selectedPeriodId);
  const { data: journalEntries = [], isLoading: journalLoading } =
    useJournalEntries(selectedPeriodId);
  const seedData = useSeedData();

  const isDataLoading = bsLoading || isLoading;
  const recentEntries = [...journalEntries]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const handleSeedData = async () => {
    try {
      await seedData.mutateAsync();
      toast.success("Data awal berhasil dimuat!");
    } catch {
      toast.error("Gagal memuat data awal. Pastikan Anda sudah login.");
    }
  };

  const labaRugi = Number(incomeStatement?.labaRugi ?? BigInt(0));
  const isProfit = labaRugi >= 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Teaching Factory DKV — SMKN 1 Dawuan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelect={setSelectedPeriodId}
            data-ocid="dashboard.period.select"
          />
          <Button
            data-ocid="dashboard.seed.button"
            variant="outline"
            size="sm"
            onClick={handleSeedData}
            disabled={seedData.isPending}
            title="Muat Data Awal"
          >
            {seedData.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span className="hidden sm:inline ml-1.5">Muat Data Awal</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {isDataLoading || periodsLoading ? (
        <CardLoadingState />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Aset
                  </CardTitle>
                  <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatRupiah(balanceSheet?.totalAset ?? BigInt(0))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total kekayaan usaha
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pendapatan
                  </CardTitle>
                  <div className="w-9 h-9 rounded-md bg-green-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatRupiah(incomeStatement?.totalPendapatan ?? BigInt(0))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jumlah pendapatan
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Beban
                  </CardTitle>
                  <div className="w-9 h-9 rounded-md bg-orange-50 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatRupiah(incomeStatement?.totalBeban ?? BigInt(0))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jumlah pengeluaran
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className={`shadow-card hover:shadow-card-hover transition-shadow ${
                isProfit ? "border-green-200" : "border-red-200"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Laba/Rugi Bersih
                  </CardTitle>
                  <div
                    className={`w-9 h-9 rounded-md flex items-center justify-center ${
                      isProfit ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <DollarSign
                      className={`w-5 h-5 ${isProfit ? "text-green-600" : "text-red-600"}`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-display font-bold ${
                    isProfit ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {formatRupiah(Math.abs(labaRugi))}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant="outline"
                    className={
                      isProfit
                        ? "text-green-700 border-green-200 bg-green-50 text-xs"
                        : "text-red-700 border-red-200 bg-red-50 text-xs"
                    }
                  >
                    {isProfit ? "Laba" : "Rugi"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">periode ini</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Recent Journal Entries */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-display">
              Jurnal Terakhir
            </CardTitle>
            <div className="flex items-center gap-2">
              {journalLoading && (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
              <Badge variant="outline" className="text-xs">
                {recentEntries.length} entri
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {journalLoading ? (
              <div className="px-6 pb-4">
                <TableLoadingState rows={5} cols={4} />
              </div>
            ) : recentEntries.length === 0 ? (
              <div
                data-ocid="dashboard.journal.empty_state"
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Database className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Belum ada jurnal
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Klik "Muat Data Awal" untuk menambah data contoh
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tanggal
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        No. Bukti
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Keterangan
                      </TableHead>
                      <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Debit
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEntries.map((entry, idx) => {
                      const totalDebit = entry.lines.reduce(
                        (sum, line) => sum + Number(line.debit),
                        0,
                      );
                      return (
                        <TableRow
                          key={entry.id.toString()}
                          data-ocid={`dashboard.journal.item.${idx + 1}`}
                          className="hover:bg-muted/40"
                        >
                          <TableCell className="pl-6 text-sm">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {entry.reference}
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {entry.description}
                          </TableCell>
                          <TableCell className="text-right pr-6 text-sm font-medium">
                            {formatRupiah(totalDebit)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Period Info */}
      {periods.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {periods.slice(0, 3).map((period, idx) => (
            <Card
              key={period.id.toString()}
              data-ocid={`dashboard.period.item.${idx + 1}`}
              className="shadow-card"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Periode</p>
                  <p className="font-medium text-sm">{period.name}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    period.status === "Open"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }
                >
                  {period.status === "Open" ? "Aktif" : "Ditutup"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
