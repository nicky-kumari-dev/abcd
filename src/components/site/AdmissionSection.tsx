import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { CLASSES, openWhatsApp } from "@/lib/school";

const schema = z.object({
  student: z.string().trim().min(2, "Please enter the student name").max(80),
  parent: z.string().trim().min(2, "Please enter the parent name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  studentClass: z.enum(CLASSES, { message: "Please select a class" }),
});

/** Admission enquiry card. Nothing is stored — it opens WhatsApp with a pre-filled message. */
export function AdmissionSection() {
  const settings = useSiteSettings();
  const [values, setValues] = useState({ student: "", parent: "", phone: "", studentClass: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    const d = parsed.data;
    openWhatsApp(
      `*Admission Enquiry — ${settings.schoolName}*\n\n` +
        `Student Name: ${d.student}\n` +
        `Parent Name: ${d.parent}\n` +
        `Phone Number: ${d.phone}\n` +
        `Class: ${d.studentClass}\n\n` +
        `Please share the admission details.`,
      settings.whatsapp,
    );
    toast.success("WhatsApp opened — just press Send to submit your enquiry.");
  }

  return (
    <section id="admission" className="bg-sky-soft py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Admission</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary-deep sm:text-4xl">
            Online Admission Enquiry
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fill the form and send it to us on WhatsApp. Our principal will get back to you shortly.
          </p>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="mt-10 space-y-5 rounded-3xl bg-card p-6 shadow-soft sm:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="student">Student Name</Label>
            <Input
              id="student"
              maxLength={80}
              value={values.student}
              onChange={(e) => setValues((v) => ({ ...v, student: e.target.value }))}
              placeholder="Child's full name"
            />
            {errors["student"] && <p className="text-sm text-destructive">{errors["student"]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Name</Label>
            <Input
              id="parent"
              maxLength={80}
              value={values.parent}
              onChange={(e) => setValues((v) => ({ ...v, parent: e.target.value }))}
              placeholder="Parent / guardian name"
            />
            {errors["parent"] && <p className="text-sm text-destructive">{errors["parent"]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={values.phone}
              onChange={(e) =>
                setValues((v) => ({ ...v, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
              }
              placeholder="10-digit mobile number"
            />
            {errors["phone"] && <p className="text-sm text-destructive">{errors["phone"]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Select Class</Label>
            <Select
              value={values.studentClass}
              onValueChange={(value) => setValues((v) => ({ ...v, studentClass: value }))}
            >
              <SelectTrigger id="class">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors["studentClass"] && (
              <p className="text-sm text-destructive">{errors["studentClass"]}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full rounded-full">
            <Send className="mr-1 h-4 w-4" />
            Submit on WhatsApp
          </Button>
        </form>
      </div>
    </section>
  );
}
