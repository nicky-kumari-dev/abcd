import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, LogOut, Plus, Save, Search, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { logoAsset as logo } from "@/lib/images";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { FeeSummaryCard } from "@/components/FeeSummaryCard";
import { FeeTracker } from "@/components/FeeTracker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  computeFeeTotals,
  currentFeeYear,
  FEE_MONTHS,
  isMonthPaid,
  isRegistrationPaid,
  type ClassFeeSettingsRow,
  type FeeMonthKey,
  type StudentFeePaymentsRow,
} from "@/lib/fees";
import {
  CLASSES,
  LECTURE_CLASSES,
  SCHOOL,
  openWhatsApp,
  type LectureClass,
  type SchoolClass,
} from "@/lib/school";
import { createStudent, deleteStudent, updateStudent } from "@/lib/students.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin-login" });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw redirect({ to: "/admin-login" });
  },
  head: () => ({
    meta: [
      { title: "Admin Panel | Bhartiya Vidyapeeth Playway School" },
      { name: "description", content: "Manage students, fees, updates and gallery." },
      { property: "og:title", content: "Admin Panel | Bhartiya Vidyapeeth Playway School" },
      { property: "og:description", content: "Manage students, fees, updates and gallery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

const emptyForm = {
  id: "",
  name: "",
  studentClass: "" as SchoolClass | "",
  phone: "",
  password: "",
};

type FeeEditTarget = {
  studentId: string;
  studentName: string;
  itemKey: "registration" | FeeMonthKey;
  itemLabel: string;
  paid: boolean;
};

/** The exact set of boolean payment columns on `student_fee_payments`, used for typed dynamic updates. */
type FeePatch = Partial<{
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
}>;
type FeePatchColumn = keyof FeePatch;

function AdminPanel() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [openId, setOpenId] = useState<string | null>(null);

  const students = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, class, phone")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const feeSettings = useQuery({
    queryKey: ["admin-fee-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_fee_settings")
        .select("class, total_fee, monthly_fee, registration_fee");
      if (error) throw error;
      return data ?? [];
    },
  });

  const feePayments = useQuery({
    queryKey: ["admin-fee-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("student_fee_payments").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const feeSettingsByClass = new Map<SchoolClass, ClassFeeSettingsRow>(
    (feeSettings.data ?? []).map((s) => [s.class as SchoolClass, s]),
  );
  const feePaymentsByStudent = new Map<string, StudentFeePaymentsRow>(
    (feePayments.data ?? []).map((p) => [p.student_id, p]),
  );

  const lectures = useQuery({
    queryKey: ["admin-lectures"],
    queryFn: async () => {
      const { data } = await supabase.from("lecture_links").select("class, url");
      return data ?? [];
    },
  });

  const gallery = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery")
        .select("id, image_url, caption, storage_path")
        .order("created_at");
      const rows = data ?? [];
      const paths = rows.filter((r) => r.storage_path).map((r) => r.storage_path as string);
      const signed: Record<string, string> = {};
      if (paths.length) {
        const { data: urls } = await supabase.storage.from("gallery").createSignedUrls(paths, 3600);
        for (const u of urls ?? []) if (u.path && u.signedUrl) signed[u.path] = u.signedUrl;
      }
      return rows.map((r) => ({
        ...r,
        url: r.storage_path ? (signed[r.storage_path] ?? "") : r.image_url,
      }));
    },
  });

  const saveStudent = useMutation({
    mutationFn: async () => {
      if (!form.studentClass) throw new Error("Please select a class");
      if (form.id) {
        await updateStudent({
          data: {
            id: form.id,
            name: form.name,
            studentClass: form.studentClass,
            phone: form.phone,
            password: form.password || "",
          },
        });
      } else {
        await createStudent({
          data: {
            name: form.name,
            studentClass: form.studentClass,
            phone: form.phone,
            password: form.password,
          },
        });
      }
    },
    onSuccess: () => {
      toast.success(form.id ? "Student updated" : "Student created");
      setForm(emptyForm);
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      qc.invalidateQueries({ queryKey: ["admin-fee-payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeStudent = useMutation({
    mutationFn: (id: string) => deleteStudent({ data: { id } }),
    onSuccess: () => {
      toast.success("Student deleted");
      setOpenId(null);
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      qc.invalidateQueries({ queryKey: ["admin-fee-payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [feeEdit, setFeeEdit] = useState<FeeEditTarget | null>(null);
  const [savingFee, setSavingFee] = useState(false);

  /** Sets a single fee item (registration or one month) to Paid / Unpaid for a student. */
  async function setFeeItem(
    studentId: string,
    itemKey: "registration" | FeeMonthKey,
    paid: boolean,
  ) {
    const column: FeePatchColumn =
      itemKey === "registration"
        ? "registration_paid"
        : FEE_MONTHS.find((m) => m.key === itemKey)!.column;
    const patch: FeePatch = {};
    patch[column] = paid;
    setSavingFee(true);
    // upsert (not update): guarantees this succeeds even for the rare case
    // where a payments row doesn't exist yet, without disturbing any other
    // column's already-recorded status.
    const { error } = await supabase
      .from("student_fee_payments")
      .upsert({ student_id: studentId, ...patch }, { onConflict: "student_id" });
    setSavingFee(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${feeEdit?.itemLabel ?? "Fee item"} marked ${paid ? "PAID" : "UNPAID"}`);
    setFeeEdit(null);
    await qc.invalidateQueries({ queryKey: ["admin-fee-payments"] });
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin-login", replace: true });
  }

  const filtered = (students.data ?? []).filter((s) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.class.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-sky-soft">
      <header className="glass-card sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt={`${SCHOOL.name} logo`}
              className="h-10 w-10 rounded-full object-contain"
            />
            <p className="text-sm font-semibold text-primary-deep">Admin Panel</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="students">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="fees">Fee Settings</TabsTrigger>
            <TabsTrigger value="learning">Today's Learning</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6 space-y-6">
            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary-deep">
                {form.id ? "Edit Student" : "Create Student"}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="s-name">Student Name</Label>
                  <Input
                    id="s-name"
                    maxLength={80}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-class">Class</Label>
                  <Select
                    value={form.studentClass}
                    onValueChange={(v) => setForm({ ...form, studentClass: v as SchoolClass })}
                  >
                    <SelectTrigger id="s-class">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-phone">Parent Phone Number</Label>
                  <Input
                    id="s-phone"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-pass">Password {form.id && "(leave blank to keep)"}</Label>
                  <Input
                    id="s-pass"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Button
                  className="rounded-full"
                  disabled={saveStudent.isPending}
                  onClick={() => saveStudent.mutate()}
                >
                  {saveStudent.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-1 h-4 w-4" />
                  )}
                  Save
                </Button>
                {form.id && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setForm(emptyForm)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-card p-6 shadow-card">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name, phone or class"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="mt-5 space-y-3">
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No students found.
                  </p>
                )}
                {filtered.map((s) => {
                  const settings = feeSettingsByClass.get(s.class as SchoolClass);
                  const payments = feePaymentsByStudent.get(s.id);
                  const { totalFee, paidFee, dueFee } = computeFeeTotals(settings, payments);
                  const feeYear = payments?.fee_year ?? currentFeeYear();

                  return (
                    <div key={s.id} className="rounded-2xl border border-border p-4">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-left"
                        onClick={() => setOpenId(openId === s.id ? null : s.id)}
                      >
                        <span>
                          <span className="block font-semibold text-primary-deep">{s.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.class} • {s.phone}
                          </span>
                        </span>
                        <span className="text-xs text-primary">
                          {openId === s.id ? "Hide" : "View"}
                        </span>
                      </button>

                      {openId === s.id && (
                        <div className="mt-4 space-y-5 border-t border-border pt-4">
                          <FeeSummaryCard totalFee={totalFee} paidFee={paidFee} dueFee={dueFee} />

                          <FeeTracker
                            year={feeYear}
                            registrationPaid={isRegistrationPaid(payments)}
                            months={FEE_MONTHS.map((m) => ({
                              key: m.key,
                              label: m.label,
                              paid: isMonthPaid(payments, m.column),
                            }))}
                            onSelectRegistration={() =>
                              setFeeEdit({
                                studentId: s.id,
                                studentName: s.name,
                                itemKey: "registration",
                                itemLabel: "Registration Fee",
                                paid: isRegistrationPaid(payments),
                              })
                            }
                            onSelectMonth={(key) => {
                              const m = FEE_MONTHS.find((mm) => mm.key === key)!;
                              setFeeEdit({
                                studentId: s.id,
                                studentName: s.name,
                                itemKey: key,
                                itemLabel: m.label,
                                paid: isMonthPaid(payments, m.column),
                              });
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Tap Registration or a month to change its status.
                          </p>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() =>
                                setForm({
                                  id: s.id,
                                  name: s.name,
                                  studentClass: s.class as SchoolClass,
                                  phone: s.phone,
                                  password: "",
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              className="rounded-full"
                              onClick={() => {
                                if (confirm(`Delete ${s.name}? This cannot be undone.`))
                                  removeStudent.mutate(s.id);
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="fees" className="mt-6">
            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary-deep">
                Fee Structure
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Total Fee, Monthly Fee and Registration Fee per class. Changes apply immediately to
                every student in that class — nothing here is hardcoded in the app.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {CLASSES.map((c) => (
                  <FeeSettingsCard
                    key={c}
                    schoolClass={c}
                    settings={feeSettingsByClass.get(c) ?? null}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["admin-fee-settings"] })}
                  />
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="learning" className="mt-6">
            <PublishPanel table="todays_learning" title="Today's Learning" />
          </TabsContent>

          <TabsContent value="homework" className="mt-6">
            <PublishPanel table="homework" title="Homework" />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary-deep">
                Gallery Management
              </h2>
              <div className="mt-4 space-y-3">
                <Label htmlFor="g-file">Upload Image</Label>
                <Input
                  id="g-file"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
                    const { error } = await supabase.storage.from("gallery").upload(path, file);
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    const caption =
                      prompt("Caption for this image", "School Activity") || "School Activity";
                    const { error: insErr } = await supabase
                      .from("gallery")
                      .insert({ image_url: "", storage_path: path, caption });
                    if (insErr) {
                      toast.error(insErr.message);
                      return;
                    }
                    toast.success("Image uploaded");
                    e.target.value = "";
                    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
                    qc.invalidateQueries({ queryKey: ["gallery"] });
                  }}
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {(gallery.data ?? []).map((g) => (
                  <div key={g.id} className="overflow-hidden rounded-2xl border border-border">
                    <img
                      src={g.url}
                      alt={g.caption}
                      loading="lazy"
                      className="h-36 w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <p className="truncate text-xs text-muted-foreground">{g.caption}</p>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={async () => {
                          if (!confirm("Delete this image?")) return;
                          if (g.storage_path)
                            await supabase.storage.from("gallery").remove([g.storage_path]);
                          await supabase.from("gallery").delete().eq("id", g.id);
                          toast.success("Image deleted");
                          qc.invalidateQueries({ queryKey: ["admin-gallery"] });
                          qc.invalidateQueries({ queryKey: ["gallery"] });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="lectures" className="mt-6">
            <section>
              <h2 className="font-display text-lg font-semibold text-primary-deep">
                Lectures Management
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add, update or remove the Google Drive lecture link for each class, Nursery through
                Class 12. Play Group has no lecture section.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {LECTURE_CLASSES.map((c) => {
                  const row = (lectures.data ?? []).find((l) => l.class === c);
                  return (
                    <LectureCard
                      key={c}
                      lectureClass={c}
                      url={row?.url ?? ""}
                      onSaved={() => qc.invalidateQueries({ queryKey: ["admin-lectures"] })}
                    />
                  );
                })}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={feeEdit !== null} onOpenChange={(o) => !o && setFeeEdit(null)}>
        <DialogContent className="max-w-xs rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">{feeEdit?.itemLabel ?? ""}</DialogTitle>
            <DialogDescription>{feeEdit?.studentName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button
              className="rounded-full bg-success text-success-foreground hover:bg-success/90"
              disabled={savingFee}
              onClick={() => feeEdit && setFeeItem(feeEdit.studentId, feeEdit.itemKey, true)}
            >
              Mark Paid
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={savingFee}
              onClick={() => feeEdit && setFeeItem(feeEdit.studentId, feeEdit.itemKey, false)}
            >
              Mark Unpaid
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Publish Today's Learning or Homework for a class, with WhatsApp sharing. */
function PublishPanel({ table, title }: { table: "todays_learning" | "homework"; title: string }) {
  const [studentClass, setStudentClass] = useState<SchoolClass | "">("");
  const [text, setText] = useState("");
  const [published, setPublished] = useState<{ cls: string; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function publish() {
    if (!studentClass) {
      toast.error("Please select a class");
      return;
    }
    if (text.trim().length < 3) {
      toast.error("Please write the update");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from(table).insert({ class: studentClass, text: text.trim() });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPublished({ cls: studentClass, text: text.trim() });
    setText("");
    toast.success(`${title} published successfully`);
  }

  return (
    <section className="rounded-3xl bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-semibold text-primary-deep">Publish {title}</h2>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={studentClass} onValueChange={(v) => setStudentClass(v as SchoolClass)}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`t-${table}`}>{title}</Label>
          <Textarea
            id={`t-${table}`}
            rows={5}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Write today's ${title.toLowerCase()}…`}
          />
        </div>
        <Button className="rounded-full" onClick={publish} disabled={saving}>
          {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Publish
        </Button>
      </div>

      {published && (
        <div className="mt-6 rounded-2xl border-2 border-success/40 bg-success/5 p-5">
          <p className="font-semibold text-success">✅ Published Successfully</p>
          <p className="mt-2 text-sm whitespace-pre-line text-foreground/80">{published.text}</p>
          <Button
            className="mt-4 rounded-full bg-success text-success-foreground hover:bg-success/90"
            onClick={() =>
              openWhatsApp(
                `*${SCHOOL.name}*\n*${title} — ${published.cls}*\n${new Date().toLocaleDateString("en-IN")}\n\n${published.text}`,
                "",
              )
            }
          >
            <Share2 className="mr-1 h-4 w-4" /> Share on WhatsApp
          </Button>
        </div>
      )}
    </section>
  );
}

/** Editable Google Drive lecture link for one class, with save/update and remove. */
function LectureCard({
  lectureClass,
  url,
  onSaved,
}: {
  lectureClass: LectureClass;
  url: string;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(url);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  return (
    <div className="rounded-3xl bg-card p-5 shadow-card">
      <h3 className="font-display font-semibold text-primary-deep">{lectureClass}</h3>
      <Input
        className="mt-3"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://drive.google.com/…"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="rounded-full"
          disabled={saving}
          onClick={async () => {
            if (!/^https:\/\/drive\.google\.com\//.test(value.trim())) {
              toast.error("Enter a valid Google Drive link");
              return;
            }
            setSaving(true);
            const { error } = await supabase.from("lecture_links").upsert({
              class: lectureClass,
              url: value.trim(),
              updated_at: new Date().toISOString(),
            });
            setSaving(false);
            if (error) {
              toast.error(error.message);
              return;
            }
            toast.success("Link saved");
            onSaved();
          }}
        >
          {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Save
        </Button>
        {url && (
          <Button
            size="sm"
            variant="destructive"
            className="rounded-full"
            disabled={removing}
            onClick={async () => {
              if (!confirm(`Remove the lecture link for ${lectureClass}?`)) return;
              setRemoving(true);
              const { error } = await supabase
                .from("lecture_links")
                .delete()
                .eq("class", lectureClass);
              setRemoving(false);
              if (error) {
                toast.error(error.message);
                return;
              }
              setValue("");
              toast.success("Link removed");
              onSaved();
            }}
          >
            {removing && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-1 h-4 w-4" /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}

/** Editable Total / Monthly / Registration fee for one admission class. */
function FeeSettingsCard({
  schoolClass,
  settings,
  onSaved,
}: {
  schoolClass: SchoolClass;
  settings: ClassFeeSettingsRow | null;
  onSaved: () => void;
}) {
  const [totalFee, setTotalFee] = useState(String(settings?.total_fee ?? ""));
  const [monthlyFee, setMonthlyFee] = useState(String(settings?.monthly_fee ?? ""));
  const [registrationFee, setRegistrationFee] = useState(String(settings?.registration_fee ?? ""));
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-3xl bg-card p-5 shadow-card">
      <h3 className="font-display font-semibold text-primary-deep">{schoolClass}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`fee-total-${schoolClass}`} className="text-xs">
            Total Fee
          </Label>
          <Input
            id={`fee-total-${schoolClass}`}
            inputMode="numeric"
            value={totalFee}
            onChange={(e) => setTotalFee(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`fee-monthly-${schoolClass}`} className="text-xs">
            Monthly Fee
          </Label>
          <Input
            id={`fee-monthly-${schoolClass}`}
            inputMode="numeric"
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`fee-reg-${schoolClass}`} className="text-xs">
            Registration Fee
          </Label>
          <Input
            id={`fee-reg-${schoolClass}`}
            inputMode="numeric"
            value={registrationFee}
            onChange={(e) => setRegistrationFee(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </div>
      <Button
        size="sm"
        className="mt-3 rounded-full"
        disabled={saving}
        onClick={async () => {
          const total = Number(totalFee);
          const monthly = Number(monthlyFee);
          const registration = Number(registrationFee);
          if (
            !totalFee ||
            !monthlyFee ||
            !registrationFee ||
            [total, monthly, registration].some((n) => Number.isNaN(n) || n < 0)
          ) {
            toast.error("Enter valid, non-negative amounts for all three fields");
            return;
          }
          setSaving(true);
          const { error } = await supabase.from("class_fee_settings").upsert({
            class: schoolClass,
            total_fee: total,
            monthly_fee: monthly,
            registration_fee: registration,
          });
          setSaving(false);
          if (error) {
            toast.error(error.message);
            return;
          }
          toast.success(`${schoolClass} fee structure updated`);
          onSaved();
        }}
      >
        {saving ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-1 h-4 w-4" />
        )}
        Save
      </Button>
    </div>
  );
}
