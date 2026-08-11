import { CalendarDays } from "lucide-react";

import { FEE_LABEL, FEE_STYLES, feeStatus, feeYearLabel, type FeeMonthKey } from "@/lib/fees";

export type FeeMonthEntry = { key: FeeMonthKey; label: string; paid: boolean };

type Props = {
  /** School year start (e.g. 2026 for the 2026–27 year). */
  year: number;
  registrationPaid: boolean;
  /** The 12 school-year months (April → March), in order. */
  months: FeeMonthEntry[];
  /** When provided, the registration card and each month card become buttons (admin only). */
  onSelectRegistration?: () => void;
  onSelectMonth?: (key: FeeMonthKey) => void;
};

/** Premium fee calendar: a Registration status card plus a 12-month grid with paid / due / pending / upcoming states. */
export function FeeTracker({
  year,
  registrationPaid,
  months,
  onSelectRegistration,
  onSelectMonth,
}: Props) {
  const monthsInteractive = Boolean(onSelectMonth);
  const registrationInteractive = Boolean(onSelectRegistration);
  const paidMonthCount = months.filter((m) => m.paid).length;

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Fee Status
          </p>
          <h3 className="font-display text-2xl font-bold text-primary-deep sm:text-3xl">
            {feeYearLabel(year)}
          </h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-primary">
          <CalendarDays className="h-3.5 w-3.5" /> {paidMonthCount}/12 months paid
        </span>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Registration
        </p>
        {(() => {
          const RegTag = registrationInteractive ? "button" : "div";
          const style = registrationPaid ? FEE_STYLES.paid : FEE_STYLES.due;
          return (
            <RegTag
              {...(registrationInteractive
                ? { type: "button" as const, onClick: () => onSelectRegistration?.() }
                : {})}
              aria-label={`Registration Fee ${registrationPaid ? "Paid" : "Unpaid"}`}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200 ${style.card} ${
                registrationInteractive
                  ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  : ""
              }`}
            >
              <span className={`text-sm font-bold ${style.month}`}>Registration Fee</span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${style.label}`}
              >
                {registrationPaid ? "PAID" : "UNPAID"}
              </span>
            </RegTag>
          );
        })()}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Monthly Fees
        </p>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {months.map(({ key, label, paid }, i) => {
            const status = feeStatus(i, paid);
            const style = FEE_STYLES[status];
            const Tag = monthsInteractive ? "button" : "div";
            return (
              <Tag
                key={key}
                {...(monthsInteractive
                  ? { type: "button" as const, onClick: () => onSelectMonth?.(key) }
                  : {})}
                aria-label={`${label} ${FEE_LABEL[status]}`}
                className={`rounded-2xl border px-2 py-3 text-center shadow-sm transition-all duration-200 sm:px-3 sm:py-4 ${style.card} ${
                  monthsInteractive
                    ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    : ""
                }`}
              >
                <p
                  className={`truncate text-[11px] font-bold tracking-wide uppercase sm:text-sm ${style.month}`}
                >
                  <span className="sm:hidden">{label.slice(0, 3)}</span>
                  <span className="hidden sm:inline">{label}</span>
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide sm:text-[10px] ${style.label}`}
                >
                  {FEE_LABEL[status]}
                </span>
              </Tag>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
        {(["paid", "pending", "due", "upcoming"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${FEE_STYLES[s].dot}`} />
            {s === "pending" ? "Current month pending" : FEE_LABEL[s].toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
