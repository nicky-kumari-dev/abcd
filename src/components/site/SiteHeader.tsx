import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Gallery", href: "#gallery" },
  { label: "Admission", href: "#admission" },
  { label: "Contact", href: "#contact" },
];

/** Sticky top navigation for the public site. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settings = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card shadow-card" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <a
          href="#home"
          className="flex min-w-0 items-center gap-3"
          aria-label={settings.schoolName}
        >
          <img
            src={settings.logo}
            alt={`${settings.schoolName} logo`}
            width={48}
            height={48}
            fetchPriority="high"
            className="h-11 w-11 shrink-0 rounded-full object-contain"
          />
          <span className="hidden text-sm leading-tight font-semibold text-primary-deep sm:block">
            Bhartiya Vidyapeeth
            <span className="block text-xs font-medium text-muted-foreground">Playway School</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              {item.label}
            </a>
          ))}
          <Button asChild size="sm" className="ml-2 rounded-full">
            <Link to="/parent-login">Student / Parent Login</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-1 rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={`tel:${settings.phoneIntl}`}
            aria-label="Call the school"
            className="rounded-full bg-accent p-2 text-primary"
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-primary p-2 text-primary-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass-card border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            <div className="md:hidden">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent"
                >
                  {item.label}
                </a>
              ))}
              <Button asChild className="mt-1 w-full rounded-xl">
                <Link to="/parent-login" onClick={() => setOpen(false)}>
                  Student / Parent Login
                </Link>
              </Button>
            </div>

            <Link
              to="/admin-login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
