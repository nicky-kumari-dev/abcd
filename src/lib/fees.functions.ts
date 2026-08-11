import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  computeFeeTotals,
  currentFeeYear,
  FEE_MONTHS,
  isRegistrationPaid,
  isMonthPaid,
  type FeeMonthKey,
} from "@/lib/fees";

export type ParentFeeSummary = {
  feeYear: number;
  totalFee: number;
  paidFee: number;
  dueFee: number;
  registrationPaid: boolean;
  months: { key: FeeMonthKey; label: string; paid: boolean }[];
};

/**
 * Returns the signed-in parent's own child's fee summary — Total/Paid/Due
 * amounts, plus Paid/Unpaid status per item. Deliberately never returns the
 * individual registration_fee or monthly_fee amounts: those live only in
 * `class_fee_settings`, which parents have no RLS access to at all, and this
 * handler reads it with the service-role client purely to compute the three
 * totals server-side before responding — the raw per-class figures never
 * leave the server.
 */
export const getParentFeeSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ParentFeeSummary | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id, class")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!student) return null;

    const [{ data: settings }, { data: payments }] = await Promise.all([
      supabaseAdmin
        .from("class_fee_settings")
        .select("total_fee, monthly_fee, registration_fee")
        .eq("class", student.class)
        .maybeSingle(),
      supabaseAdmin
        .from("student_fee_payments")
        .select("*")
        .eq("student_id", student.id)
        .maybeSingle(),
    ]);

    const { totalFee, paidFee, dueFee } = computeFeeTotals(settings, payments);

    return {
      feeYear: payments?.fee_year ?? currentFeeYear(),
      totalFee,
      paidFee,
      dueFee,
      registrationPaid: isRegistrationPaid(payments),
      months: FEE_MONTHS.map((m) => ({
        key: m.key,
        label: m.label,
        paid: isMonthPaid(payments, m.column),
      })),
    };
  });
