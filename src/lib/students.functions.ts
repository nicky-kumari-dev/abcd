import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CLASS_VALUES = ["Play Group", "NUR", "LKG", "UKG"] as const;

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, { message: "Enter a valid 10-digit phone number" });
const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters" })
  .max(72);
const nameSchema = z.string().trim().min(2, { message: "Enter the student name" }).max(80);

const createSchema = z.object({
  name: nameSchema,
  studentClass: z.enum(CLASS_VALUES),
  phone: phoneSchema,
  password: passwordSchema,
});

const updateSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
  studentClass: z.enum(CLASS_VALUES),
  phone: phoneSchema,
  password: z.union([passwordSchema, z.literal("")]).optional(),
});

function loginEmail(phone: string) {
  return `${phone}@bvps.parent.local`;
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("phone", data.phone)
      .maybeSingle();
    if (existing) throw new Error("A student with this phone number already exists");

    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail(data.phone),
      password: data.password,
      email_confirm: true,
    });
    if (authError || !created.user)
      throw new Error(authError?.message ?? "Could not create the login");

    const { error } = await supabaseAdmin.from("students").insert({
      user_id: created.user.id,
      name: data.name,
      class: data.studentClass,
      phone: data.phone,
    });
    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const updateStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: student, error: readError } = await supabaseAdmin
      .from("students")
      .select("id, user_id, phone")
      .eq("id", data.id)
      .maybeSingle();
    if (readError || !student) throw new Error("Student not found");

    if (data.phone !== student.phone) {
      const { data: clash } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("phone", data.phone)
        .maybeSingle();
      if (clash) throw new Error("Another student already uses this phone number");
    }

    if (student.user_id) {
      const attrs: { email?: string; password?: string } = {};
      if (data.phone !== student.phone) attrs.email = loginEmail(data.phone);
      if (data.password) attrs.password = data.password;
      if (Object.keys(attrs).length > 0) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(student.user_id, attrs);
        if (error) throw new Error(error.message);
      }
    }

    const { error } = await supabaseAdmin
      .from("students")
      .update({ name: data.name, class: data.studentClass, phone: data.phone })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: student } = await supabaseAdmin
      .from("students")
      .select("user_id")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("students").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (student?.user_id) await supabaseAdmin.auth.admin.deleteUser(student.user_id);
    return { ok: true };
  });
