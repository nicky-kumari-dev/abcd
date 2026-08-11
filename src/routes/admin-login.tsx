import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { logoAsset as logo } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { SCHOOL } from "@/lib/school";

export const Route = createFileRoute("/admin-login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Login | Bhartiya Vidyapeeth Playway School" },
      { name: "description", content: "Staff sign-in for school administration." },
      { property: "og:title", content: "Admin Login | Bhartiya Vidyapeeth Playway School" },
      { property: "og:description", content: "Staff sign-in for school administration." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/admin-login" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error || !data.user) {
      setLoading(false);
      toast.error("Invalid email or password");
      return;
    }
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setLoading(false);
    if (!role) {
      await supabase.auth.signOut();
      toast.error("This account is not an administrator");
      return;
    }
    navigate({ to: "/admin", replace: true });
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
            <h1 className="mt-4 font-display text-2xl font-bold text-primary-deep">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">School administration panel</p>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className="pl-9"
                  placeholder="admin@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
        </div>
      </div>
    </main>
  );
}
