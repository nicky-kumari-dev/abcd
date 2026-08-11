import { Baby, HeartHandshake, ShieldCheck, Sparkles, MonitorPlay, Palette } from "lucide-react";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { CLASSES, CLASS_AGES } from "@/lib/school";

const FEATURES = [
  {
    icon: Palette,
    title: "Activity-Based Learning",
    text: "Play, art, rhymes and stories turn every lesson into an adventure your child looks forward to.",
  },
  {
    icon: HeartHandshake,
    title: "Caring, Experienced Teachers",
    text: "Trained early-childhood educators who know every child by name and nurture them patiently.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & CCTV Monitored",
    text: "A secure, hygienic campus under full CCTV surveillance so parents stay worry-free all day.",
  },
  {
    icon: MonitorPlay,
    title: "Smart Classrooms",
    text: "Audio-visual smart classes make concepts simple, colourful and easy to remember.",
  },
  {
    icon: Baby,
    title: "Holistic Child Development",
    text: "Yoga, dance, celebrations and speech activities build confidence, health and social skills.",
  },
  {
    icon: Sparkles,
    title: "Joyful Environment",
    text: "Bright, cheerful rooms designed to make little learners feel completely at home.",
  },
];

/** About the school plus the classes offered. */
export function About() {
  const settings = useSiteSettings();

  return (
    <section id="about" className="bg-sky-soft py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            About Our School
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary-deep sm:text-4xl">
            {settings.tagline}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            At {settings.schoolName}, we believe the early years shape a lifetime. Our play-way
            method blends structured learning with music, movement and imagination, so children
            build strong foundations in language, numbers and confidence — all while having fun.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl bg-card p-6 shadow-card transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-primary-deep">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CLASSES.map((name) => (
            <div
              key={name}
              className="rounded-2xl border-2 border-primary/15 bg-card px-5 py-6 text-center shadow-card"
            >
              <p className="font-display text-xl font-bold text-primary">{name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{CLASS_AGES[name]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
