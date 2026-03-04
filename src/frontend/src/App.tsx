import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Menu, X } from "lucide-react";
import { useState } from "react";

import { AppSidebar } from "./components/AppSidebar";
import { LocalAuthProvider } from "./components/LocalAuthProvider";
import { useLocalAuth } from "./hooks/useLocalAuth";
import { useLogoUrl } from "./hooks/useQueries";
import { Accounts } from "./pages/Accounts";
import { BalanceSheet } from "./pages/BalanceSheet";
import { Dashboard } from "./pages/Dashboard";
import { IncomeStatement } from "./pages/IncomeStatement";
import { Journal } from "./pages/Journal";
import { Ledger } from "./pages/Ledger";
import { LoginPage } from "./pages/LoginPage";
import { Periods } from "./pages/Periods";
import { Settings } from "./pages/Settings";
import { TrialBalance } from "./pages/TrialBalance";

type Page =
  | "dashboard"
  | "accounts"
  | "journal"
  | "ledger"
  | "trial-balance"
  | "income-statement"
  | "balance-sheet"
  | "periods"
  | "settings";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  accounts: "Daftar Akun",
  journal: "Jurnal Umum",
  ledger: "Buku Besar",
  "trial-balance": "Neraca Saldo",
  "income-statement": "Laporan Laba Rugi",
  "balance-sheet": "Neraca",
  periods: "Periode Akuntansi",
  settings: "Pengaturan",
};

function renderPage(page: Page) {
  switch (page) {
    case "dashboard":
      return <Dashboard />;
    case "accounts":
      return <Accounts />;
    case "journal":
      return <Journal />;
    case "ledger":
      return <Ledger />;
    case "trial-balance":
      return <TrialBalance />;
    case "income-statement":
      return <IncomeStatement />;
    case "balance-sheet":
      return <BalanceSheet />;
    case "periods":
      return <Periods />;
    case "settings":
      return <Settings />;
    default:
      return <Dashboard />;
  }
}

function AppShell() {
  const { isLoggedIn, isLoading } = useLocalAuth();
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: logoUrl } = useLogoUrl();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[oklch(0.14_0.03_258)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
          <p className="text-sm text-white/40">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  const handleNavigate = (page: string) => {
    setActivePage(page as Page);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 no-print">
        <AppSidebar activePage={activePage} onNavigate={handleNavigate} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop dismiss
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden no-print"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden no-print transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar activePage={activePage} onNavigate={handleNavigate} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="no-print flex items-center justify-between px-4 sm:px-6 h-14 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden h-8 w-8 p-0"
              data-ocid="nav.mobile_menu.button"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Teaching Factory DKV
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                /
              </span>
              <span className="text-sm font-semibold text-foreground">
                {pageTitles[activePage]}
              </span>
            </div>
          </div>

          {/* Right side: school branding */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  SMKN 1 Dawuan
                </p>
                <p className="text-xs text-muted-foreground">
                  Sistem Akuntansi TEFA DKV
                </p>
              </div>
              <img
                src={
                  logoUrl ??
                  "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png"
                }
                alt="SMKN 1 Dawuan"
                className="w-8 h-8 rounded-md object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png";
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto print-container">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {renderPage(activePage)}
          </div>
        </main>

        {/* Footer */}
        <footer className="no-print border-t border-border px-6 py-3 bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Sistem Akuntansi Teaching Factory DKV — SMKN 1 Dawuan</span>
            <span>
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Built with ♥ using caffeine.ai
              </a>
            </span>
          </div>
        </footer>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <LocalAuthProvider>
      <AppShell />
    </LocalAuthProvider>
  );
}
