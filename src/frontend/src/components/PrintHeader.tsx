interface PrintHeaderProps {
  title: string;
  periodName?: string;
}

export function PrintHeader({ title, periodName }: PrintHeaderProps) {
  return (
    <div className="print-only mb-6 text-center border-b pb-4">
      <div className="flex items-center justify-center gap-4 mb-2">
        <img
          src="/assets/generated/smkn1-dawuan-logo-transparent.dim_120x120.png"
          alt="SMKN 1 Dawuan"
          className="w-16 h-16 object-contain"
        />
        <div>
          <h1 className="text-xl font-bold">SMKN 1 DAWUAN</h1>
          <p className="text-sm">
            Teaching Factory DKV (Desain Komunikasi Visual)
          </p>
          <p className="text-xs text-gray-600">
            Jl. Raya Dawuan, Karawang, Jawa Barat
          </p>
        </div>
      </div>
      <div className="border-t-2 border-b-2 border-gray-800 py-1 mt-2">
        <h2 className="text-lg font-bold uppercase">{title}</h2>
        {periodName && <p className="text-sm">Periode: {periodName}</p>}
      </div>
    </div>
  );
}
