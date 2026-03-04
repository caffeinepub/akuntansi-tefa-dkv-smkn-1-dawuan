import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { useLogoUrl } from "../hooks/useQueries";

export function LoginPage() {
  const { login } = useLocalAuth();
  const { data: logoUrl } = useLogoUrl();

  const [usernameVal, setUsernameVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoSrc =
    logoUrl ??
    "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usernameVal.trim() || !passwordVal) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const success = await login(usernameVal.trim(), passwordVal);
      if (!success) {
        setError("Username atau password salah");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background layers */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Deep navy gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.16_0.04_258)] via-[oklch(0.12_0.03_258)] to-[oklch(0.18_0.05_262)]" />
        {/* Subtle radial glow at centre */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,oklch(0.55_0.18_258/0.12),transparent)]" />
        {/* Gold accent circle top-right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[oklch(0.75_0.16_75/0.07)] blur-3xl" />
        {/* Soft blue circle bottom-left */}
        <div className="absolute -bottom-48 -left-24 w-[32rem] h-[32rem] rounded-full bg-[oklch(0.42_0.16_258/0.1)] blur-3xl" />
        {/* Diagonal grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Header above card */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl mb-4 flex items-center justify-center">
            <img
              src={logoSrc}
              alt="SMKN 1 Dawuan"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png";
              }}
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-white leading-tight tracking-tight">
            Sistem Akuntansi
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Teaching Factory DKV SMKN 1 Dawuan
          </p>
        </div>

        <Card className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-2xl text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white/90">
              Masuk ke Aplikasi
            </CardTitle>
            <CardDescription className="text-white/50 text-sm">
              Masukkan username dan password untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="login-username"
                  className="text-sm font-medium text-white/75"
                >
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Masukkan username"
                    autoComplete="username"
                    autoFocus
                    value={usernameVal}
                    onChange={(e) => {
                      setUsernameVal(e.target.value);
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="pl-9 bg-white/[0.07] border-white/[0.15] text-white placeholder:text-white/30 focus:border-white/40 focus:ring-white/20 h-10"
                    data-ocid="login.username.input"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="login-password"
                  className="text-sm font-medium text-white/75"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    value={passwordVal}
                    onChange={(e) => {
                      setPasswordVal(e.target.value);
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="pl-9 pr-10 bg-white/[0.07] border-white/[0.15] text-white placeholder:text-white/30 focus:border-white/40 focus:ring-white/20 h-10"
                    data-ocid="login.password.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error state */}
              {error && (
                <div
                  className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2"
                  data-ocid="login.error_state"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Loading state indicator */}
              {isSubmitting && (
                <div
                  className="flex items-center justify-center gap-2 text-sm text-white/50 py-1"
                  data-ocid="login.loading_state"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting || !usernameVal.trim() || !passwordVal}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-1"
                data-ocid="login.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            {/* Default credentials hint */}
            <div className="mt-5 pt-4 border-t border-white/[0.08]">
              <p className="text-xs text-white/30 text-center">
                Default: <span className="text-white/50 font-mono">admin</span>{" "}
                / <span className="text-white/50 font-mono">admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-white/25 mt-6">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
