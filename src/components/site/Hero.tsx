import { Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles } from "lucide-react";

import { heroAsset as heroImg } from "@/lib/images";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";

/** Landing hero with the school logo, headline and primary actions. */
export function Hero() {
  const settings = useSiteSettings();

  return (
    <section id="home" className="relative flex min-h-[92vh] items-center overflow-hidden">
      <img
        src={heroImg.url}
        alt="Bright, colourful kindergarten classroom at Bhartiya Vidyapeeth Playway School"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/90 via-primary/75 to-sky/60" />

      <div className="relative mx-auto w-full max-w-5xl px-4 pt-28 pb-16 text-center sm:px-6">
        <img
          src={settings.logo}
          alt={`${settings.schoolName} official logo`}
          width={132}
          height={132}
          fetchPriority="high"
          className="animate-rise mx-auto h-28 w-28 rounded-full bg-white/95 object-contain p-1.5 shadow-soft sm:h-32 sm:w-32"
        />

        <p className="animate-rise mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Admission Open • Session 2026-27
        </p>

        <h1 className="animate-rise mt-5 font-display text-3xl leading-tight font-extrabold text-white sm:text-5xl lg:text-6xl">
          Where Little Hands Learn,
          <span className="block text-gold">Big Dreams Begin</span>
        </h1>

        <p className="animate-rise mx-auto mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
          {settings.schoolName} — a second home for your child in Sikanderpur, Ballia. Joyful
          activity-based learning, caring teachers and a safe, CCTV-monitored campus with smart
          classes.
        </p>

        <div className="animate-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-gold px-8 text-gold-foreground hover:bg-gold/90 sm:w-auto"
          >
            <a href="#admission">
              <GraduationCap className="mr-1 h-5 w-5" />
              Admission Open
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full rounded-full border-white/70 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white hover:text-primary sm:w-auto"
          >
            <Link to="/parent-login">Student / Parent Login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
