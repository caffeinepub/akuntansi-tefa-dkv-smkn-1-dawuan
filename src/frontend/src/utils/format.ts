/**
 * Format a bigint or number as Indonesian Rupiah
 */
export function formatRupiah(amount: bigint | number): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a bigint or number as a plain Indonesian number (no currency symbol)
 */
export function formatNumber(amount: bigint | number): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Parse an Indonesian formatted number string to number
 */
export function parseIndonesianNumber(value: string): number {
  // Remove dots (thousand separators) and replace commas with dots
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  return Number.parseFloat(cleaned) || 0;
}

/**
 * Format a date string (YYYY-MM-DD) to Indonesian locale
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day),
  );
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a bigint nanosecond timestamp to Indonesian locale
 */
export function formatTimestamp(nanoseconds: bigint): string {
  const milliseconds = Number(nanoseconds) / 1_000_000;
  const date = new Date(milliseconds);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1] ?? "-";
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
