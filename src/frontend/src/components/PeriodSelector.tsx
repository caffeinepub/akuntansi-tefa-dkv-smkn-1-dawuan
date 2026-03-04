import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Period } from "../backend.d";

interface PeriodSelectorProps {
  periods: Period[];
  selectedPeriodId: bigint | null;
  onSelect: (periodId: bigint | null) => void;
  allowAll?: boolean;
  placeholder?: string;
  "data-ocid"?: string;
}

export function PeriodSelector({
  periods,
  selectedPeriodId,
  onSelect,
  allowAll = true,
  placeholder = "Pilih Periode",
  "data-ocid": dataOcid,
}: PeriodSelectorProps) {
  const value = selectedPeriodId === null ? "all" : selectedPeriodId.toString();

  const handleChange = (val: string) => {
    if (val === "all") {
      onSelect(null);
    } else {
      onSelect(BigInt(val));
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger data-ocid={dataOcid} className="w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value="all">Semua Periode</SelectItem>}
        {periods.map((p) => (
          <SelectItem key={p.id.toString()} value={p.id.toString()}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
