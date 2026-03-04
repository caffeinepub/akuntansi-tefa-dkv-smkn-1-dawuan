import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Principal } from "@icp-sdk/core/principal";
import {
  Eye,
  EyeOff,
  ImageIcon,
  KeyRound,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UserRole } from "../backend.d";
import { PageHeader } from "../components/PageHeader";
import {
  useAssignCustomRole,
  useChangeLocalPassword,
  useCreateLocalUser,
  useDeleteLocalUser,
  useIsAdmin,
  useLocalUsers,
  useLogoUrl,
  useSetLogoUrl,
  useUsersList,
} from "../hooks/useQueries";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  bendahara: "Bendahara",
  manager: "Manager",
  user: "User",
  guest: "Tamu",
};

const ROLE_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  admin: "destructive",
  bendahara: "default",
  manager: "secondary",
  user: "outline",
  guest: "outline",
};

function LogoTab() {
  const { data: logoUrl, isLoading: logoLoading } = useLogoUrl();
  const setLogoMutation = useSetLogoUrl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingBase64, setPendingBase64] = useState<string | null>(null);

  const currentLogo =
    previewUrl ??
    logoUrl ??
    "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimum 500 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPreviewUrl(base64);
      setPendingBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveLogo() {
    if (!pendingBase64) {
      toast.error("Pilih file logo terlebih dahulu.");
      return;
    }
    try {
      await setLogoMutation.mutateAsync(pendingBase64);
      toast.success("Logo berhasil disimpan!");
      setPendingBase64(null);
    } catch {
      toast.error("Gagal menyimpan logo. Coba lagi.");
    }
  }

  function handleResetPreview() {
    setPreviewUrl(null);
    setPendingBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo Sekolah
          </CardTitle>
          <CardDescription>
            Upload logo sekolah yang akan ditampilkan di sidebar dan header
            aplikasi. Format: PNG, JPG, atau SVG. Maks 500 KB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Logo Preview */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0">
              <p className="text-sm font-medium text-foreground mb-2">
                Logo Saat Ini
              </p>
              {logoLoading ? (
                <div
                  className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center"
                  data-ocid="settings.logo.loading_state"
                >
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-border bg-muted overflow-hidden flex items-center justify-center">
                  <img
                    src={currentLogo}
                    alt="Logo SMKN 1 Dawuan"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Preview Logo Baru
                </p>
                <p className="text-xs text-muted-foreground">
                  Logo baru akan ditampilkan setelah berhasil disimpan
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  data-ocid="settings.logo.upload_button"
                >
                  <Upload className="w-4 h-4" />
                  Pilih File
                </Label>
                <input
                  id="logo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  data-ocid="settings.logo.dropzone"
                />
                {pendingBase64 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPreview}
                    data-ocid="settings.logo.cancel_button"
                  >
                    Batal
                  </Button>
                )}
              </div>

              {pendingBase64 && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ File baru siap diupload
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              onClick={handleSaveLogo}
              disabled={!pendingBase64 || setLogoMutation.isPending}
              data-ocid="settings.logo.save_button"
            >
              {setLogoMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {setLogoMutation.isPending ? "Menyimpan..." : "Simpan Logo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const { data: users = [], isLoading: usersLoading } = useUsersList();
  const assignRoleMutation = useAssignCustomRole();
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>(
    {},
  );

  // Add new user state
  const [newPrincipalInput, setNewPrincipalInput] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user" as UserRole);
  const [isAddingUser, setIsAddingUser] = useState(false);

  async function handleAddUser() {
    const trimmed = newPrincipalInput.trim();
    if (!trimmed) {
      toast.error("Principal ID tidak boleh kosong");
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(trimmed);
    } catch {
      toast.error("Gagal menambahkan user. Pastikan Principal ID valid.");
      return;
    }

    setIsAddingUser(true);
    try {
      await assignRoleMutation.mutateAsync({ user: principal, role: newRole });
      toast.success("User berhasil ditambahkan");
      setNewPrincipalInput("");
      setNewRole("user" as UserRole);
    } catch {
      toast.error("Gagal menambahkan user. Pastikan Principal ID valid.");
    } finally {
      setIsAddingUser(false);
    }
  }

  function getPrincipalKey(principal: unknown): string {
    return String(principal);
  }

  function handleRoleChange(principalStr: string, role: UserRole) {
    setPendingRoles((prev) => ({ ...prev, [principalStr]: role }));
  }

  async function handleSaveRole(principalStr: string, principal: unknown) {
    const newRole = pendingRoles[principalStr];
    if (!newRole) return;

    try {
      await assignRoleMutation.mutateAsync({
        user: principal as import("../backend.d").UserEntry["principal"],
        role: newRole,
      });
      toast.success(
        `Role berhasil diubah menjadi ${ROLE_LABELS[newRole] ?? newRole}`,
      );
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[principalStr];
        return next;
      });
    } catch {
      toast.error("Gagal mengubah role. Coba lagi.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New User Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Tambah User Baru
          </CardTitle>
          <CardDescription>
            Daftarkan pengguna baru dengan Principal ID dan assign role langsung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label
                htmlFor="new-principal-input"
                className="text-xs font-medium"
              >
                Principal ID
              </Label>
              <Input
                id="new-principal-input"
                placeholder="aaaaa-bbbbb-ccccc-ddddd-eee"
                value={newPrincipalInput}
                onChange={(e) => setNewPrincipalInput(e.target.value)}
                className="font-mono text-xs"
                data-ocid="settings.add_user.input"
              />
            </div>
            <div className="w-full sm:w-[180px] space-y-1.5">
              <Label htmlFor="new-role-select" className="text-xs font-medium">
                Role
              </Label>
              <Select
                value={newRole}
                onValueChange={(val) => setNewRole(val as UserRole)}
              >
                <SelectTrigger
                  id="new-role-select"
                  data-ocid="settings.add_user.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="bendahara">Bendahara</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="guest">Tamu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddUser}
              disabled={isAddingUser}
              className="w-full sm:w-auto flex-shrink-0"
              data-ocid="settings.add_user.submit_button"
            >
              {isAddingUser ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isAddingUser ? "Menambahkan..." : "Tambah User"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Daftar Pengguna
          </CardTitle>
          <CardDescription>
            Kelola akses pengguna dan atur role untuk setiap akun. Role
            menentukan fitur apa yang dapat diakses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="settings.users.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Memuat data pengguna...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="settings.users.empty_state"
            >
              <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Belum ada pengguna terdaftar
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Pengguna akan muncul setelah login ke aplikasi
              </p>
            </div>
          ) : (
            <div
              className="rounded-md border border-border overflow-hidden"
              data-ocid="settings.users.table"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Principal ID</TableHead>
                    <TableHead>Role Saat Ini</TableHead>
                    <TableHead className="w-[220px]">Ubah Role</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => {
                    const principalStr = getPrincipalKey(user.principal);
                    const pendingRole = pendingRoles[principalStr];
                    const currentRole = user.role as string;
                    const isModified = !!pendingRole;
                    const isSaving =
                      assignRoleMutation.isPending &&
                      assignRoleMutation.variables?.user === user.principal;

                    return (
                      <TableRow
                        key={principalStr}
                        data-ocid={`settings.users.row.${index + 1}`}
                      >
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {principalStr.length > 20
                              ? `${principalStr.slice(0, 10)}...${principalStr.slice(-6)}`
                              : principalStr}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ROLE_COLORS[currentRole] ?? "outline"}
                          >
                            {ROLE_LABELS[currentRole] ?? currentRole}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={pendingRole ?? currentRole}
                            onValueChange={(val) =>
                              handleRoleChange(principalStr, val as UserRole)
                            }
                          >
                            <SelectTrigger
                              className="h-8 text-xs"
                              data-ocid={`settings.users.select.${index + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="bendahara">
                                Bendahara
                              </SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="guest">Tamu</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={isModified ? "default" : "outline"}
                            disabled={!isModified || isSaving}
                            onClick={() =>
                              handleSaveRole(principalStr, user.principal)
                            }
                            className="h-8 text-xs"
                            data-ocid={`settings.users.save_button.${index + 1}`}
                          >
                            {isSaving ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            <span className="ml-1">
                              {isSaving ? "..." : "Simpan"}
                            </span>
                          </Button>
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

      {/* Role Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Keterangan Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="destructive" className="mt-0.5 flex-shrink-0">
                Admin
              </Badge>
              <p className="text-xs text-muted-foreground">
                Akses penuh: kelola akun, jurnal, laporan, user, dan pengaturan
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="default" className="mt-0.5 flex-shrink-0">
                Bendahara
              </Badge>
              <p className="text-xs text-muted-foreground">
                Input transaksi, jurnal harian, dan cetak laporan keuangan
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                Manager
              </Badge>
              <p className="text-xs text-muted-foreground">
                Lihat semua laporan keuangan dan analisis data
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                User
              </Badge>
              <p className="text-xs text-muted-foreground">
                Akses dasar: lihat dashboard dan laporan standar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LocalUsersTab() {
  const { data: localUsers = [], isLoading } = useLocalUsers();
  const createUserMutation = useCreateLocalUser();
  const deleteUserMutation = useDeleteLocalUser();
  const changePasswordMutation = useChangeLocalPassword();

  // New user form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("bendahara" as UserRole);

  // Change password dialog state
  const [changePwDialogOpen, setChangePwDialogOpen] = useState(false);
  const [changePwTarget, setChangePwTarget] = useState<string>("");
  const [newPwValue, setNewPwValue] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  async function handleCreateUser() {
    const trimmedUser = newUsername.trim();
    if (!trimmedUser) {
      toast.error("Username tidak boleh kosong");
      return;
    }
    if (!newPassword) {
      toast.error("Password tidak boleh kosong");
      return;
    }
    try {
      const hash = await hashPassword(newPassword);
      const result = await createUserMutation.mutateAsync({
        username: trimmedUser,
        passwordHash: hash,
        role: newRole,
      });
      if (result.__kind__ === "ok") {
        toast.success(`User "${trimmedUser}" berhasil dibuat`);
        setNewUsername("");
        setNewPassword("");
        setNewRole("bendahara" as UserRole);
      } else {
        toast.error(`Gagal membuat user: ${result.err}`);
      }
    } catch {
      toast.error("Gagal membuat user. Coba lagi.");
    }
  }

  async function handleDeleteUser(username: string) {
    try {
      const ok = await deleteUserMutation.mutateAsync(username);
      if (ok) {
        toast.success(`User "${username}" berhasil dihapus`);
      } else {
        toast.error("Gagal menghapus user.");
      }
    } catch {
      toast.error("Gagal menghapus user. Coba lagi.");
    }
  }

  function openChangePw(username: string) {
    setChangePwTarget(username);
    setNewPwValue("");
    setShowNewPw(false);
    setChangePwDialogOpen(true);
  }

  async function handleChangePassword() {
    if (!newPwValue) {
      toast.error("Password baru tidak boleh kosong");
      return;
    }
    try {
      const hash = await hashPassword(newPwValue);
      const ok = await changePasswordMutation.mutateAsync({
        username: changePwTarget,
        newPasswordHash: hash,
      });
      if (ok) {
        toast.success(`Password "${changePwTarget}" berhasil diubah`);
        setChangePwDialogOpen(false);
      } else {
        toast.error("Gagal mengubah password.");
      }
    } catch {
      toast.error("Gagal mengubah password. Coba lagi.");
    }
  }

  const formatDate = (ts: bigint) => {
    try {
      return new Date(Number(ts / BigInt(1_000_000))).toLocaleDateString(
        "id-ID",
        { day: "2-digit", month: "short", year: "numeric" },
      );
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      {/* Add new local user */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Tambah Akun Login Baru
          </CardTitle>
          <CardDescription>
            Buat akun login dengan username dan password untuk akses sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Username</Label>
              <Input
                placeholder="contoh: bendahara1"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                data-ocid="settings.local_user.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-9"
                  data-ocid="settings.local_user_password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1.5 w-full sm:w-[160px]">
              <Label className="text-xs font-medium">Role</Label>
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as UserRole)}
              >
                <SelectTrigger data-ocid="settings.local_user_role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="bendahara">Bendahara</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
              className="w-full sm:w-auto flex-shrink-0"
              data-ocid="settings.local_user.submit_button"
            >
              {createUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {createUserMutation.isPending ? "Membuat..." : "Buat Akun"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Local users list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Daftar Akun Login
          </CardTitle>
          <CardDescription>
            Kelola username dan password untuk akses ke sistem akuntansi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="settings.local_users.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Memuat data...
              </span>
            </div>
          ) : localUsers.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="settings.local_users.empty_state"
            >
              <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Belum ada akun login
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Tambahkan akun baru di form di atas
              </p>
            </div>
          ) : (
            <div
              className="rounded-md border border-border overflow-hidden"
              data-ocid="settings.local_users.table"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="w-[140px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localUsers.map((user, index) => (
                    <TableRow
                      key={user.username}
                      data-ocid={`settings.local_users.row.${index + 1}`}
                    >
                      <TableCell>
                        <span className="font-mono text-sm font-medium">
                          {user.username}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ROLE_COLORS[String(user.role)] ?? "outline"}
                        >
                          {ROLE_LABELS[String(user.role)] ?? String(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => openChangePw(user.username)}
                            data-ocid={`settings.local_users.edit_button.${index + 1}`}
                          >
                            <KeyRound className="w-3 h-3 mr-1" />
                            Password
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                            onClick={() => handleDeleteUser(user.username)}
                            disabled={
                              deleteUserMutation.isPending &&
                              deleteUserMutation.variables === user.username
                            }
                            data-ocid={`settings.local_users.delete_button.${index + 1}`}
                          >
                            {deleteUserMutation.isPending &&
                            deleteUserMutation.variables === user.username ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change password dialog */}
      <Dialog open={changePwDialogOpen} onOpenChange={setChangePwDialogOpen}>
        <DialogContent data-ocid="settings.change_password.dialog">
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Masukkan password baru untuk akun{" "}
              <span className="font-mono font-semibold">{changePwTarget}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password Baru</Label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  value={newPwValue}
                  onChange={(e) => setNewPwValue(e.target.value)}
                  className="pr-9"
                  autoFocus
                  data-ocid="settings.change_password.input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleChangePassword();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNewPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangePwDialogOpen(false)}
              data-ocid="settings.change_password.cancel_button"
            >
              Batal
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={!newPwValue || changePasswordMutation.isPending}
              data-ocid="settings.change_password.confirm_button"
            >
              {changePasswordMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {changePasswordMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Settings() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (adminLoading) {
    return (
      <div
        className="flex items-center justify-center py-20"
        data-ocid="settings.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Memeriksa akses...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        data-ocid="settings.error_state"
      >
        <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Akses Dibatasi
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Halaman Pengaturan hanya dapat diakses oleh Administrator. Silakan
          hubungi admin untuk mendapatkan akses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        subtitle="Kelola logo sekolah dan manajemen pengguna aplikasi"
      />

      <Tabs defaultValue="login-accounts" className="w-full">
        <TabsList
          className="mb-6 flex-wrap h-auto gap-1"
          data-ocid="settings.tab"
        >
          <TabsTrigger
            value="login-accounts"
            data-ocid="settings.login_accounts.tab"
          >
            <Lock className="w-4 h-4 mr-2" />
            Akun Login
          </TabsTrigger>
          <TabsTrigger value="logo" data-ocid="settings.logo.tab">
            <ImageIcon className="w-4 h-4 mr-2" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="settings.users.tab">
            <Users className="w-4 h-4 mr-2" />
            Manajemen User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login-accounts">
          <LocalUsersTab />
        </TabsContent>

        <TabsContent value="logo">
          <LogoTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
