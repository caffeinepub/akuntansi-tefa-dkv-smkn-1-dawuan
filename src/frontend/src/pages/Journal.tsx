import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Account, JournalLine } from "../backend.d";
import { TableLoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PeriodSelector } from "../components/PeriodSelector";
import {
  useAccounts,
  useAddJournalEntry,
  useDeleteJournalEntry,
  useJournalEntries,
  usePeriods,
} from "../hooks/useQueries";
import { formatDate, formatRupiah, getTodayString } from "../utils/format";

let lineIdCounter = 0;
function newLineId() {
  lineIdCounter += 1;
  return `line-${lineIdCounter}`;
}

interface JournalLineForm {
  _id: string;
  accountId: string;
  description: string;
  debit: string;
  kredit: string;
}

const emptyLine = (): JournalLineForm => ({
  _id: newLineId(),
  accountId: "",
  description: "",
  debit: "",
  kredit: "",
});

export function Journal() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<bigint | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  // Form state
  const [formDate, setFormDate] = useState(getTodayString());
  const [formRef, setFormRef] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPeriodId, setFormPeriodId] = useState<string>("");
  const [formLines, setFormLines] = useState<JournalLineForm[]>([
    emptyLine(),
    emptyLine(),
  ]);

  const { data: periods = [] } = usePeriods();
  const { data: accounts = [] } = useAccounts();
  const { data: entries = [], isLoading } = useJournalEntries(selectedPeriodId);
  const addEntry = useAddJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const totalDebit = formLines.reduce(
    (s, l) => s + (Number.parseFloat(l.debit) || 0),
    0,
  );
  const totalKredit = formLines.reduce(
    (s, l) => s + (Number.parseFloat(l.kredit) || 0),
    0,
  );
  const isBalanced = Math.abs(totalDebit - totalKredit) < 0.01;

  const getAccountName = (id: bigint) =>
    accounts.find((a) => a.id === id)?.name ?? String(id);

  const addLine = () => setFormLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx: number) =>
    setFormLines((prev) => prev.filter((_, i) => i !== idx));
  const updateLine = (
    idx: number,
    field: keyof JournalLineForm,
    value: string,
  ) =>
    setFormLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    );

  const resetForm = () => {
    setFormDate(getTodayString());
    setFormRef("");
    setFormDesc("");
    setFormPeriodId("");
    setFormLines([emptyLine(), emptyLine()]);
  };

  const handleAdd = async () => {
    if (!formDate || !formRef || !formDesc) {
      toast.error("Tanggal, No. Bukti, dan Keterangan wajib diisi");
      return;
    }
    if (!formPeriodId) {
      toast.error("Pilih periode akuntansi");
      return;
    }
    if (!isBalanced) {
      toast.error("Total debit dan kredit harus seimbang");
      return;
    }
    const validLines = formLines.filter(
      (l) =>
        l.accountId &&
        (Number.parseFloat(l.debit) > 0 || Number.parseFloat(l.kredit) > 0),
    );
    if (validLines.length < 2) {
      toast.error("Minimal 2 baris jurnal dengan akun dan nominal");
      return;
    }

    const lines: JournalLine[] = validLines.map((l) => ({
      accountId: BigInt(l.accountId),
      description: l.description,
      debit: BigInt(Math.round(Number.parseFloat(l.debit) || 0)),
      kredit: BigInt(Math.round(Number.parseFloat(l.kredit) || 0)),
    }));

    try {
      await addEntry.mutateAsync({
        date: formDate,
        description: formDesc,
        reference: formRef,
        periodId: BigInt(formPeriodId),
        lines,
      });
      toast.success("Jurnal berhasil disimpan");
      setAddOpen(false);
      resetForm();
    } catch {
      toast.error("Gagal menyimpan jurnal");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEntry.mutateAsync(deleteId);
      toast.success("Jurnal berhasil dihapus");
      setDeleteId(null);
    } catch {
      toast.error("Gagal menghapus jurnal");
    }
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Jurnal Umum"
        subtitle="Catat setiap transaksi keuangan Teaching Factory"
      >
        <PeriodSelector
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onSelect={setSelectedPeriodId}
          data-ocid="journal.period.select"
        />
        <Dialog
          open={addOpen}
          onOpenChange={(open) => {
            setAddOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button data-ocid="journal.add.open_modal_button" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Jurnal
            </Button>
          </DialogTrigger>
          <DialogContent
            data-ocid="journal.add.modal"
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Tambah Jurnal Baru</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Header fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tanggal</Label>
                  <Input
                    data-ocid="journal.add.date.input"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>No. Bukti</Label>
                  <Input
                    data-ocid="journal.add.reference.input"
                    placeholder="mis. JU-2024-001"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Keterangan</Label>
                  <Input
                    data-ocid="journal.add.description.input"
                    placeholder="Keterangan transaksi"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Periode</Label>
                  <Select value={formPeriodId} onValueChange={setFormPeriodId}>
                    <SelectTrigger data-ocid="journal.add.period.select">
                      <SelectValue placeholder="Pilih Periode" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods
                        .filter((p) => p.status === "Open")
                        .map((p) => (
                          <SelectItem
                            key={p.id.toString()}
                            value={p.id.toString()}
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Baris Jurnal</h4>
                  <Button
                    data-ocid="journal.add.line.button"
                    variant="outline"
                    size="sm"
                    onClick={addLine}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah Baris
                  </Button>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs w-[200px]">
                          Akun
                        </TableHead>
                        <TableHead className="text-xs">Keterangan</TableHead>
                        <TableHead className="text-xs text-right w-[130px]">
                          Debit (Rp)
                        </TableHead>
                        <TableHead className="text-xs text-right w-[130px]">
                          Kredit (Rp)
                        </TableHead>
                        <TableHead className="text-xs w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formLines.map((line, idx) => (
                        <TableRow
                          key={line._id}
                          data-ocid={`journal.add.line.item.${idx + 1}`}
                        >
                          <TableCell className="py-1.5">
                            <Select
                              value={line.accountId}
                              onValueChange={(v) =>
                                updateLine(idx, "accountId", v)
                              }
                            >
                              <SelectTrigger
                                data-ocid={`journal.add.line.account.select.${idx + 1}`}
                                className="h-8 text-xs"
                              >
                                <SelectValue placeholder="Pilih akun" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts
                                  .filter((a) => a.isActive)
                                  .sort((a, b) => a.code.localeCompare(b.code))
                                  .map((a) => (
                                    <SelectItem
                                      key={a.id.toString()}
                                      value={a.id.toString()}
                                    >
                                      {a.code} — {a.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Input
                              data-ocid={`journal.add.line.desc.input.${idx + 1}`}
                              value={line.description}
                              onChange={(e) =>
                                updateLine(idx, "description", e.target.value)
                              }
                              placeholder="Keterangan"
                              className="h-8 text-xs"
                            />
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Input
                              data-ocid={`journal.add.line.debit.input.${idx + 1}`}
                              type="number"
                              min="0"
                              value={line.debit}
                              onChange={(e) => {
                                updateLine(idx, "debit", e.target.value);
                                if (e.target.value)
                                  updateLine(idx, "kredit", "");
                              }}
                              placeholder="0"
                              className="h-8 text-xs text-right"
                            />
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Input
                              data-ocid={`journal.add.line.kredit.input.${idx + 1}`}
                              type="number"
                              min="0"
                              value={line.kredit}
                              onChange={(e) => {
                                updateLine(idx, "kredit", e.target.value);
                                if (e.target.value)
                                  updateLine(idx, "debit", "");
                              }}
                              placeholder="0"
                              className="h-8 text-xs text-right"
                            />
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Button
                              data-ocid={`journal.add.line.delete_button.${idx + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(idx)}
                              disabled={formLines.length <= 2}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="flex items-center justify-between mt-3 p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    {!isBalanced && totalDebit > 0 && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Debit ≠ Kredit (Selisih:{" "}
                        {formatRupiah(Math.abs(totalDebit - totalKredit))})
                      </div>
                    )}
                    {isBalanced && totalDebit > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                      >
                        ✓ Seimbang
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Total Debit
                      </p>
                      <p className="font-semibold">
                        {formatRupiah(totalDebit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Total Kredit
                      </p>
                      <p className="font-semibold">
                        {formatRupiah(totalKredit)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                data-ocid="journal.add.cancel_button"
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                data-ocid="journal.add.submit_button"
                onClick={handleAdd}
                disabled={addEntry.isPending || !isBalanced}
              >
                {addEntry.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Jurnal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Journal Table */}
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableLoadingState rows={5} cols={5} />
          </div>
        ) : sortedEntries.length === 0 ? (
          <div
            data-ocid="journal.empty_state"
            className="flex flex-col items-center justify-center py-16"
          >
            <p className="text-muted-foreground text-sm">
              Belum ada jurnal untuk periode ini
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide pl-6">
                  Tanggal
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  No. Bukti
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Keterangan
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">
                  Total Debit
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">
                  Total Kredit
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right pr-6">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry, idx) => {
                const totalD = entry.lines.reduce(
                  (s, l) => s + Number(l.debit),
                  0,
                );
                const totalK = entry.lines.reduce(
                  (s, l) => s + Number(l.kredit),
                  0,
                );
                const isExpanded = expandedId === entry.id.toString();

                return (
                  <>
                    <TableRow
                      key={entry.id.toString()}
                      data-ocid={`journal.item.${idx + 1}`}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : entry.id.toString())
                      }
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
                      <TableCell className="text-right text-sm">
                        {formatRupiah(totalD)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatRupiah(totalK)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(
                                isExpanded ? null : entry.id.toString(),
                              );
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            data-ocid={`journal.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(entry.id);
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <TableRow
                        key={`${entry.id}-detail`}
                        className="bg-muted/20 hover:bg-muted/20"
                      >
                        <TableCell colSpan={6} className="p-0">
                          <div className="px-8 py-4">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="text-xs font-semibold text-muted-foreground h-8">
                                    Akun
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold text-muted-foreground h-8">
                                    Keterangan
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold text-muted-foreground text-right h-8">
                                    Debit
                                  </TableHead>
                                  <TableHead className="text-xs font-semibold text-muted-foreground text-right h-8">
                                    Kredit
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {entry.lines.map((line, li) => (
                                  <TableRow
                                    key={`${line.accountId.toString()}-${li}`}
                                    className="hover:bg-transparent border-0"
                                  >
                                    <TableCell className="text-sm py-1.5 pl-0">
                                      {getAccountName(line.accountId)}
                                    </TableCell>
                                    <TableCell className="text-sm py-1.5 text-muted-foreground">
                                      {line.description || "—"}
                                    </TableCell>
                                    <TableCell className="text-sm py-1.5 text-right">
                                      {Number(line.debit) > 0
                                        ? formatRupiah(Number(line.debit))
                                        : "—"}
                                    </TableCell>
                                    <TableCell className="text-sm py-1.5 text-right">
                                      {Number(line.kredit) > 0
                                        ? formatRupiah(Number(line.kredit))
                                        : "—"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="journal.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Jurnal yang dihapus akan
              hilang permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="journal.delete.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="journal.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
