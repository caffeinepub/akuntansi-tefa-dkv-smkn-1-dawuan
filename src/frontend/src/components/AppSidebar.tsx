import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  BookOpen,
  Building2,
  CalendarRange,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Scale,
  Settings,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { useLogoUrl } from "../hooks/useQueries";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "#dashboard",
  },
  { id: "accounts", label: "Daftar Akun", icon: BookOpen, href: "#accounts" },
  { id: "journal", label: "Jurnal Umum", icon: FileText, href: "#journal" },
  { id: "ledger", label: "Buku Besar", icon: BookMarked, href: "#ledger" },
  {
    id: "trial-balance",
    label: "Neraca Saldo",
    icon: Scale,
    href: "#trial-balance",
  },
  {
    id: "income-statement",
    label: "Laba Rugi",
    icon: TrendingUp,
    href: "#income-statement",
  },
  {
    id: "balance-sheet",
    label: "Neraca",
    icon: Building2,
    href: "#balance-sheet",
  },
  { id: "periods", label: "Periode", icon: CalendarRange, href: "#periods" },
  {
    id: "settings",
    label: "Pengaturan",
    icon: Settings,
    href: "#settings",
    adminOnly: true,
  },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  bendahara: "Bendahara",
  manager: "Manager",
  user: "User",
  guest: "Tamu",
};

const ROLE_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  admin: "destructive",
  bendahara: "default",
  manager: "secondary",
  user: "outline",
  guest: "outline",
};

interface AppSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isCollapsed?: boolean;
}

export function AppSidebar({
  activePage,
  onNavigate,
  isCollapsed = false,
}: AppSidebarProps) {
  const { username, role, logout } = useLocalAuth();
  const { data: logoUrl } = useLogoUrl();

  const displayLogoSrc =
    logoUrl ??
    "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png";

  const roleKey = role ? String(role) : null;
  const roleLabel = roleKey ? (ROLE_LABELS[roleKey] ?? roleKey) : null;
  const roleBadgeVariant: "default" | "secondary" | "destructive" | "outline" =
    roleKey ? (ROLE_BADGE_VARIANT[roleKey] ?? "outline") : "outline";

  const isAdmin = roleKey === "admin";
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        "no-print flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-sidebar-accent flex items-center justify-center">
          <img
            src={displayLogoSrc}
            alt="SMKN 1 Dawuan"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png";
            }}
          />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-sidebar-foreground leading-tight truncate">
              Teaching Factory
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              DKV SMKN 1 Dawuan
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-ocid={`nav.${item.id}.link`}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 opacity-70" />
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Auth Section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="space-y-2">
          {!isCollapsed && username && (
            <div className="px-2 py-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <UserCircle className="w-3 h-3 text-sidebar-foreground/40 flex-shrink-0" />
                <p className="text-xs text-sidebar-foreground/50">
                  Masuk sebagai
                </p>
                {roleLabel && (
                  <Badge
                    variant={roleBadgeVariant}
                    className="text-[10px] px-1.5 py-0 h-4 ml-auto"
                  >
                    {roleLabel}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-semibold text-sidebar-foreground truncate pl-0.5">
                {username}
              </p>
            </div>
          )}
          <Button
            data-ocid="nav.logout.button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed ? "justify-center px-0" : "justify-start gap-2",
            )}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && "Keluar"}
          </Button>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />
      {!isCollapsed && (
        <div className="px-4 py-3">
          <p className="text-xs text-sidebar-foreground/30 text-center">
            Sistem Akuntansi v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
