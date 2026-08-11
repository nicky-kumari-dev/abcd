import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { logoAsset as logo } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { SCHOOL, phoneToEmail } from "@/lib/school";

export const Route = createFileRoute("/parent-login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Parent Login | Bhartiya Vidyapeeth Playway School" },
      {
        name: "description",
        content:
          "Parents of Bhartiya Vidyapeeth Playway School can sign in with their phone number to view learning updates, homework, lectures and fee status.",
      },
      { property: "og:title", content: "Parent Login | Bhartiya Vidyapeeth Playway School" },
      {
        property: "og:description",
        content: "Sign in to view your child's learning updates, homework and fee status.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/parent-login" }],
  }),
  component: ParentLogin,
});

function ParentLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Invalid phone number");
      return;
    }
    if (password.length < 6) {
      toast.error("Incorrect password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("Invalid phone number or password");
      return;
    }
    navigate({ to: "/parent", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-soft px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>

        <div className="rounded-3xl bg-card p-7 shadow-soft sm:p-9">
          <div className="text-center">
            <img
              src={logo.url}
              alt={`${SCHOOL.name} logo`}
              width={72}
              height={72}
              className="mx-auto h-18 w-18 rounded-full object-contain"
            />
            <h1 className="mt-4 font-display text-2xl font-bold text-primary-deep">Parent Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the phone number and password given by the Principal.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="username"
                  className="pl-9"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-9"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Forgot your password? Please contact the school office at{" "}
            <a className="font-medium text-primary" href={`tel:${SCHOOL.phoneIntl}`}>
              {SCHOOL.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
