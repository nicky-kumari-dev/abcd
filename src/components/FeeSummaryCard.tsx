import { formatINR } from "@/lib/fees";

type Props = {
  totalFee: number;
  paidFee: number;
  dueFee: number;
};

/** Total / Paid / Due amounts only — never the individual registration or monthly figures (see Requirement 3, Parent Fee UI). */
export function FeeSummaryCard({ totalFee, paidFee, dueFee }: Props) {
  const stats: { label: string; value: number; tone: string }[] = [
    { label: "Total Fee", value: totalFee, tone: "text-primary-deep" },
    { label: "Paid Fee", value: paidFee, tone: "text-success" },
    { label: "Due Fee", value: dueFee, tone: dueFee > 0 ? "text-destructive" : "text-success" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border bg-card px-3 py-4 text-center shadow-sm"
        >
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-xs">
            {s.label}
          </p>
          <p className={`font-display mt-1 text-lg font-bold sm:text-2xl ${s.tone}`}>
            {formatINR(s.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
