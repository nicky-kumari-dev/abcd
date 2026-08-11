export type FeeStatus = "paid" | "due" | "pending" | "upcoming";

/** The 12 fee months in the school's actual year order (April → March), each with the `student_fee_payments` column it maps to. */
export const FEE_MONTHS = [
  { key: "apr", label: "April", column: "apr_paid" },
  { key: "may", label: "May", column: "may_paid" },
  { key: "jun", label: "June", column: "jun_paid" },
  { key: "jul", label: "July", column: "jul_paid" },
  { key: "aug", label: "August", column: "aug_paid" },
  { key: "sep", label: "September", column: "sep_paid" },
  { key: "oct", label: "October", column: "oct_paid" },
  { key: "nov", label: "November", column: "nov_paid" },
  { key: "dec", label: "December", column: "dec_paid" },
  { key: "jan", label: "January", column: "jan_paid" },
  { key: "feb", label: "February", column: "feb_paid" },
  { key: "mar", label: "March", column: "mar_paid" },
] as const;

export type FeeMonthKey = (typeof FEE_MONTHS)[number]["key"];
export type FeeMonthColumn = (typeof FEE_MONTHS)[number]["column"];

/** Raw fee structure for one class, as stored in `class_fee_settings`. */
export type ClassFeeSettingsRow = {
  total_fee: number;
  monthly_fee: number;
  registration_fee: number;
};

/** Raw per-student payment state, as stored in `student_fee_payments`. */
export type StudentFeePaymentsRow =
  | {
      fee_year: number;
      registration_paid: boolean;
      apr_paid: boolean;
      may_paid: boolean;
      jun_paid: boolean;
      jul_paid: boolean;
      aug_paid: boolean;
      sep_paid: boolean;
      oct_paid: boolean;
      nov_paid: boolean;
      dec_paid: boolean;
      jan_paid: boolean;
      feb_paid: boolean;
      mar_paid: boolean;
    }
  | null
  | undefined;

export function isRegistrationPaid(payments: StudentFeePaymentsRow): boolean {
  return payments?.registration_paid === true;
}

export function isMonthPaid(payments: StudentFeePaymentsRow, column: FeeMonthColumn): boolean {
  return payments ? payments[column] === true : false;
}

/**
 * Single source of truth for Paid Fee / Due Fee. Never store these — always
 * derive them from the settings + payment booleans so they can't drift out
 * of sync with what's actually been marked paid.
 */
export function computeFeeTotals(
  settings: ClassFeeSettingsRow | null | undefined,
  payments: StudentFeePaymentsRow,
) {
  const totalFee = settings?.total_fee ?? 0;
  const monthlyFee = settings?.monthly_fee ?? 0;
  const registrationFee = settings?.registration_fee ?? 0;

  const paidMonths = FEE_MONTHS.filter((m) => isMonthPaid(payments, m.column)).length;
  const paidFee = (isRegistrationPaid(payments) ? registrationFee : 0) + paidMonths * monthlyFee;
  const dueFee = Math.max(totalFee - paidFee, 0);

  return { totalFee, paidFee, dueFee, paidMonths };
}

/** The school year runs April → March. Returns the starting calendar year (e.g. Feb 2027 is in the "2026" school year). */
export function currentFeeYear(now: Date = new Date()): number {
  const year = now.getFullYear();
  return now.getMonth() >= 3 ? year : year - 1; // getMonth() is 0-indexed; 3 = April
}

/** "2026" -> "2026–27" for display. */
export function feeYearLabel(year: number): string {
  return `${year}–${String((year + 1) % 100).padStart(2, "0")}`;
}

/** Maps a JS calendar month (0=Jan..11=Dec) to its position in the April-start school year (0=April..11=March). */
function schoolYearIndex(calendarMonthIndex: number): number {
  return (calendarMonthIndex - 3 + 12) % 12;
}

/**
 * Resolves the visual status of a school-year month (0=April..11=March).
 * paid → green, current unpaid → orange (pending), past unpaid → red (due),
 * future unpaid → neutral (upcoming).
 */
export function feeStatus(monthIndex: number, paid: boolean, now: Date = new Date()): FeeStatus {
  if (paid) return "paid";
  const current = schoolYearIndex(now.getMonth());
  if (monthIndex < current) return "due";
  if (monthIndex === current) return "pending";
  return "upcoming";
}

export const FEE_LABEL: Record<FeeStatus, string> = {
  paid: "PAID",
  due: "DUE",
  pending: "PENDING",
  upcoming: "UPCOMING",
};

/** Tailwind classes per status, built on the project's semantic tokens. */
export const FEE_STYLES: Record<
  FeeStatus,
  { card: string; month: string; label: string; dot: string }
> = {
  paid: {
    card: "border-success/40 bg-success/10",
    month: "text-success",
    label: "bg-success text-success-foreground",
    dot: "bg-success",
  },
  due: {
    card: "border-destructive/40 bg-destructive/10",
    month: "text-destructive",
    label: "bg-destructive text-destructive-foreground",
    dot: "bg-destructive",
  },
  pending: {
    card: "border-gold/50 bg-gold/15",
    month: "text-gold-foreground",
    label: "bg-gold text-gold-foreground",
    dot: "bg-gold",
  },
  upcoming: {
    card: "border-border bg-muted/40",
    month: "text-muted-foreground",
    label: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
};

/** Formats a whole-rupee amount as "₹13,300" (Indian digit grouping). */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
