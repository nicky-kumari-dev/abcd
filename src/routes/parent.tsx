import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, GraduationCap, LogOut, NotebookPen, PlayCircle } from "lucide-react";

import { logoAsset as logo } from "@/lib/images";
import { FeeSummaryCard } from "@/components/FeeSummaryCard";
import { FeeTracker } from "@/components/FeeTracker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getParentFeeSummary } from "@/lib/fees.functions";
import { lectureClassFor, SCHOOL, type SchoolClass } from "@/lib/school";

export const Route = createFileRoute("/parent")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/parent-login" });
  },
  head: () => ({
    meta: [
      { title: "Parent Dashboard | Bhartiya Vidyapeeth Playway School" },
      {
        name: "description",
        content: "Your child's learning updates, homework, lectures and fee status.",
      },
      { property: "og:title", content: "Parent Dashboard | Bhartiya Vidyapeeth Playway School" },
      {
        property: "og:description",
        content: "Your child's learning updates, homework and fee status.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ParentDashboard,
});

function ParentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: async () => {
      const { data: student } = await supabase
        .from("students")
        .select("id, name, class")
        .maybeSingle();
      if (!student) return null;

      const lectureClass = lectureClassFor(student.class as SchoolClass);

      const [learning, homework, lecture, fee] = await Promise.all([
        supabase
          .from("todays_learning")
          .select("text, publish_date")
          .eq("class", student.class)
          .order("publish_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("homework")
          .select("text, publish_date")
          .eq("class", student.class)
          .order("publish_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        lectureClass
          ? supabase.from("lecture_links").select("url").eq("class", lectureClass).maybeSingle()
          : Promise.resolve({ data: null }),
        getParentFeeSummary(),
      ]);

      return {
        student,
        learning: learning.data,
        homework: homework.data,
        lectureClass,
        lectureUrl: lecture.data?.url ?? null,
        fee,
      };
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/parent-login", replace: true });
  }

  return (
    <div className="min-h-screen bg-sky-soft">
      <header className="glass-card sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt={`${SCHOOL.name} logo`}
              className="h-10 w-10 rounded-full object-contain"
            />
            <p className="text-sm font-semibold text-primary-deep">Parent Portal</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {isLoading ? (
          <p className="py-20 text-center text-muted-foreground">Loading…</p>
        ) : !data?.student ? (
          <div className="rounded-3xl bg-card p-10 text-center shadow-card">
            <p className="font-semibold text-primary-deep">Student not found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please contact the school office at {SCHOOL.phone}.
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-3xl bg-royal-gradient p-6 text-primary-foreground shadow-soft">
              <p className="text-xs font-semibold tracking-wide uppercase opacity-80">Student</p>
              <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                {data.student.name}
              </h1>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
                <GraduationCap className="h-4 w-4" /> {data.student.class}
              </p>
            </section>

            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-deep">
                <BookOpen className="h-5 w-5 text-primary" /> Today's Learning
              </h2>
              {data.learning ? (
                <>
                  <p className="mt-3 text-sm whitespace-pre-line text-foreground/90">
                    {data.learning.text}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{data.learning.publish_date}</p>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No learning updates available.</p>
              )}
            </section>

            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-deep">
                <NotebookPen className="h-5 w-5 text-primary" /> Homework
              </h2>
              {data.homework ? (
                <>
                  <p className="mt-3 text-sm whitespace-pre-line text-foreground/90">
                    {data.homework.text}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{data.homework.publish_date}</p>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No homework has been uploaded for today.
                </p>
              )}
            </section>

            {/* Play Group has no lecture class, so this section is skipped entirely for it. */}
            {data.lectureClass && (
              <section className="rounded-3xl bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-deep">
                  <PlayCircle className="h-5 w-5 text-primary" /> Online Lectures
                </h2>
                {data.lectureUrl ? (
                  <Button asChild className="mt-4 rounded-full">
                    <a href={data.lectureUrl} target="_blank" rel="noopener noreferrer">
                      Open {data.lectureClass} Lectures
                    </a>
                  </Button>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No lecture link has been added yet.
                  </p>
                )}
              </section>
            )}

            <section className="rounded-3xl bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary-deep">Fee Details</h2>
              {data.fee ? (
                <div className="mt-4 space-y-6">
                  <FeeSummaryCard
                    totalFee={data.fee.totalFee}
                    paidFee={data.fee.paidFee}
                    dueFee={data.fee.dueFee}
                  />
                  <FeeTracker
                    year={data.fee.feeYear}
                    registrationPaid={data.fee.registrationPaid}
                    months={data.fee.months}
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Fee information isn't available yet. Please contact the school office at{" "}
                  {SCHOOL.phone}.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
