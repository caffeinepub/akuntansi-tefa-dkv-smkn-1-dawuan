import { Check, Pencil, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AccountType, NormalBalance } from "../backend.d";
import { AccountTypeBadge } from "../components/AccountTypeBadge";
import { TableLoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import {
  useAccounts,
  useAddAccount,
  useUpdateAccount,
} from "../hooks/useQueries";

type EditState = {
  id: bigint;
  code: string;
  name: string;
  isActive: boolean;
} | null;

export function Accounts() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editState, setEditState] = useState<EditState>(null);
  const [filterType, setFilterType] = useState<AccountType | "all">("all");

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<AccountType>(AccountType.Aset);
  const [newNormal, setNewNormal] = useState<NormalBalance>(
    NormalBalance.Debit,
  );

  const { data: accounts = [], isLoading } = useAccounts();
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();

  const filtered = accounts.filter((a) => {
    const matchSearch =
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.accountType === filterType;
    return matchSearch && matchType;
  });

  const handleAdd = async () => {
    if (!newCode || !newName) {
      toast.error("Kode dan nama akun wajib diisi");
      return;
    }
    try {
      await addAccount.mutateAsync({
        code: newCode,
        name: newName,
        accountType: newType,
        normalBalance: newNormal,
      });
      toast.success(`Akun "${newName}" berhasil ditambahkan`);
      setAddOpen(false);
      setNewCode("");
      setNewName("");
    } catch {
      toast.error("Gagal menambahkan akun");
    }
  };

  const handleUpdate = async () => {
    if (!editState) return;
    try {
      await updateAccount.mutateAsync({
        id: editState.id,
        code: editState.code,
        name: editState.name,
        isActive: editState.isActive,
      });
      toast.success("Akun berhasil diperbarui");
      setEditState(null);
    } catch {
      toast.error("Gagal memperbarui akun");
    }
  };

  // Auto-set normal balance based on account type
  const handleTypeChange = (type: AccountType) => {
    setNewType(type);
    if (type === AccountType.Aset || type === AccountType.Beban) {
      setNewNormal(NormalBalance.Debit);
    } else {
      setNewNormal(NormalBalance.Kredit);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Daftar Akun"
        subtitle="Kelola akun-akun dalam bagan akun Teaching Factory"
      >
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button data-ocid="accounts.add.open_modal_button" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Akun
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="accounts.add.modal">
            <DialogHeader>
              <DialogTitle>Tambah Akun Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="acc-code">Kode Akun</Label>
                  <Input
                    data-ocid="accounts.add.code.input"
                    id="acc-code"
                    placeholder="mis. 1-1001"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-type">Jenis Akun</Label>
                  <Select
                    value={newType}
                    onValueChange={(v) => handleTypeChange(v as AccountType)}
                  >
                    <SelectTrigger
                      data-ocid="accounts.add.type.select"
                      id="acc-type"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AccountType).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-name">Nama Akun</Label>
                <Input
                  data-ocid="accounts.add.name.input"
                  id="acc-name"
                  placeholder="mis. Kas dan Setara Kas"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-normal">Saldo Normal</Label>
                <Select
                  value={newNormal}
                  onValueChange={(v) => setNewNormal(v as NormalBalance)}
                >
                  <SelectTrigger
                    data-ocid="accounts.add.normal.select"
                    id="acc-normal"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NormalBalance.Debit}>Debit</SelectItem>
                    <SelectItem value={NormalBalance.Kredit}>Kredit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                data-ocid="accounts.add.cancel_button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Batal
              </Button>
              <Button
                data-ocid="accounts.add.submit_button"
                onClick={handleAdd}
                disabled={addAccount.isPending}
              >
                {addAccount.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="accounts.search_input"
            placeholder="Cari kode atau nama akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as AccountType | "all")}
        >
          <SelectTrigger data-ocid="accounts.filter.select" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            {Object.values(AccountType).map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        {Object.values(AccountType).map((type) => {
          const count = accounts.filter((a) => a.accountType === type).length;
          return (
            <button
              type="button"
              key={type}
              onClick={() => setFilterType(filterType === type ? "all" : type)}
              className="transition-transform hover:scale-105"
            >
              <AccountTypeBadge
                type={type}
                className="cursor-pointer text-xs py-1"
              />
              <span className="ml-1 text-xs text-muted-foreground">
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableLoadingState rows={6} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="accounts.empty_state"
            className="flex flex-col items-center justify-center py-16"
          >
            <p className="text-muted-foreground text-sm">
              Tidak ada akun ditemukan
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Kode
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Nama Akun
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Jenis
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Saldo Normal
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((account, idx) => {
                const isEditing = editState?.id === account.id;
                return (
                  <TableRow
                    key={account.id.toString()}
                    data-ocid={`accounts.item.${idx + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {isEditing ? (
                        <Input
                          data-ocid={`accounts.edit.code.input.${idx + 1}`}
                          value={editState.code}
                          onChange={(e) =>
                            setEditState((s) =>
                              s ? { ...s, code: e.target.value } : s,
                            )
                          }
                          className="w-24 h-7 text-sm"
                        />
                      ) : (
                        account.code
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {isEditing ? (
                        <Input
                          data-ocid={`accounts.edit.name.input.${idx + 1}`}
                          value={editState.name}
                          onChange={(e) =>
                            setEditState((s) =>
                              s ? { ...s, name: e.target.value } : s,
                            )
                          }
                          className="h-7 text-sm"
                        />
                      ) : (
                        account.name
                      )}
                    </TableCell>
                    <TableCell>
                      <AccountTypeBadge type={account.accountType} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {account.normalBalance}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            data-ocid={`accounts.edit.active.switch.${idx + 1}`}
                            checked={editState.isActive}
                            onCheckedChange={(v) =>
                              setEditState((s) =>
                                s ? { ...s, isActive: v } : s,
                              )
                            }
                          />
                          <span className="text-xs">
                            {editState.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            account.isActive
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-gray-50 text-gray-500 border-gray-200 text-xs"
                          }
                        >
                          {account.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              data-ocid={`accounts.edit.save_button.${idx + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={handleUpdate}
                              disabled={updateAccount.isPending}
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              data-ocid={`accounts.edit.cancel_button.${idx + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditState(null)}
                              className="h-7 px-2 text-muted-foreground"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            data-ocid={`accounts.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditState({
                                id: account.id,
                                code: account.code,
                                name: account.name,
                                isActive: account.isActive,
                              })
                            }
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Menampilkan {filtered.length} dari {accounts.length} akun
      </p>
    </div>
  );
}
