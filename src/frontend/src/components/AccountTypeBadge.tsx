import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AccountType } from "../backend.d";

interface AccountTypeBadgeProps {
  type: AccountType;
  className?: string;
}

export function AccountTypeBadge({ type, className }: AccountTypeBadgeProps) {
  const config: Record<AccountType, { label: string; className: string }> = {
    [AccountType.Aset]: {
      label: "Aset",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    [AccountType.Kewajiban]: {
      label: "Kewajiban",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    [AccountType.Modal]: {
      label: "Modal",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    [AccountType.Pendapatan]: {
      label: "Pendapatan",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    },
    [AccountType.Beban]: {
      label: "Beban",
      className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    },
  };

  const c = config[type] ?? {
    label: type,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge
      variant="outline"
      className={cn(c.className, "font-medium text-xs border-0", className)}
    >
      {c.label}
    </Badge>
  );
}
