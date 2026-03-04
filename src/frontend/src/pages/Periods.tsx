import { CalendarCheck, Loader2, Lock, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { TableLoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useAddPeriod, useClosePeriod, usePeriods } from "../hooks/useQueries";
import { getMonthName } from "../utils/format";

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getMonthName(i + 1),
}));

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

export function Periods() {
  const [addOpen, setAddOpen] = useState(false);
  const [closeId, setCloseId] = useState<bigint | null>(null);

  const [formName, setFormName] = useState("");
  const [formMonth, setFormMonth] = useState(String(new Date().getMonth() + 1));
  const [formYear, setFormYear] = useState(String(currentYear));

  const { data: periods = [], isLoading } = usePeriods();
  const addPeriod = useAddPeriod();
  const closePeriod = useClosePeriod();

  const handleAdd = async () => {
    if (!formName) {
      toast.error("Nama periode wajib diisi");
      return;
    }
    try {
      await addPeriod.mutateAsync({
        name: formName,
        month: BigInt(formMonth),
        year: BigInt(formYear),
      });
      toast.success(`Periode "${formName}" berhasil ditambahkan`);
      setAddOpen(false);
      setFormName("");
    } catch {
      toast.error("Gagal menambahkan periode");
    }
  };

  const handleClose = async () => {
    if (!closeId) return;
    try {
      await closePeriod.mutateAsync(closeId);
      toast.success("Periode berhasil ditutup");
      setCloseId(null);
    } catch {
      toast.error("Gagal menutup periode");
    }
  };

  // Auto-set name when month/year changes
  const handleMonthChange = (m: string) => {
    setFormMonth(m);
    setFormName(`${getMonthName(Number.parseInt(m))} ${formYear}`);
  };
  const handleYearChange = (y: string) => {
    setFormYear(y);
    setFormName(`${getMonthName(Number.parseInt(formMonth))} ${y}`);
  };

  const sortedPeriods = [...periods].sort((a, b) => {
    if (Number(b.year) !== Number(a.year))
      return Number(b.year) - Number(a.year);
    return Number(b.month) - Number(a.month);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Periode Akuntansi"
        subtitle="Kelola periode laporan keuangan Teaching Factory"
      >
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button data-ocid="periods.add.open_modal_button" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Periode
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="periods.add.modal">
            <DialogHeader>
              <DialogTitle>Tambah Periode Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Bulan</Label>
                  <Select value={formMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger data-ocid="periods.add.month.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tahun</Label>
                  <Select value={formYear} onValueChange={handleYearChange}>
                    <SelectTrigger data-ocid="periods.add.year.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Nama Periode</Label>
                <Input
                  data-ocid="periods.add.name.input"
                  placeholder="mis. Januari 2025"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                data-ocid="periods.add.cancel_button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Batal
              </Button>
              <Button
                data-ocid="periods.add.submit_button"
                onClick={handleAdd}
                disabled={addPeriod.isPending}
              >
                {addPeriod.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Periode Aktif</p>
          <p className="text-2xl font-display font-bold text-green-700">
            {periods.filter((p) => p.status === "Open").length}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Periode Ditutup</p>
          <p className="text-2xl font-display font-bold text-muted-foreground">
            {periods.filter((p) => p.status === "Closed").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableLoadingState rows={4} cols={4} />
          </div>
        ) : sortedPeriods.length === 0 ? (
          <div
            data-ocid="periods.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <CalendarCheck className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Belum ada periode akuntansi
            </p>
            <Button
              data-ocid="periods.empty.add.button"
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Periode Pertama
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wide">
                  Nama Periode
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Bulan
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Tahun
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right pr-6">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPeriods.map((period, idx) => (
                <TableRow
                  key={period.id.toString()}
                  data-ocid={`periods.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-medium text-sm">
                    {period.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getMonthName(Number(period.month))}
                  </TableCell>
                  <TableCell className="text-sm">
                    {period.year.toString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        period.status === "Open"
                          ? "bg-green-50 text-green-700 border-green-200 text-xs"
                          : "bg-gray-50 text-gray-500 border-gray-200 text-xs"
                      }
                    >
                      {period.status === "Open" ? "Aktif" : "Ditutup"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {period.status === "Open" && (
                      <Button
                        data-ocid={`periods.close_button.${idx + 1}`}
                        variant="outline"
                        size="sm"
                        onClick={() => setCloseId(period.id)}
                        className="h-7 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Tutup Periode
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Close Confirmation */}
      <AlertDialog open={!!closeId} onOpenChange={() => setCloseId(null)}>
        <AlertDialogContent data-ocid="periods.close.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Tutup Periode?</AlertDialogTitle>
            <AlertDialogDescription>
              Setelah ditutup, periode ini tidak dapat dibuka kembali dan tidak
              bisa menerima jurnal baru. Pastikan semua transaksi sudah diinput
              dengan benar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="periods.close.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="periods.close.confirm_button"
              onClick={handleClose}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {closePeriod.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menutup...
                </>
              ) : (
                "Ya, Tutup Periode"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
