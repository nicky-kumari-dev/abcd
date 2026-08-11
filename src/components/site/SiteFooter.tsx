import { MapPin, Phone, MessageCircle } from "lucide-react";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SCHOOL } from "@/lib/school";

/** Public site footer with quick links and contact details. */
export function SiteFooter() {
  const settings = useSiteSettings();

  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={settings.logo}
              alt={`${settings.schoolName} logo`}
              width={56}
              height={56}
              loading="lazy"
              className="h-14 w-14 rounded-full bg-white/95 object-contain p-1"
            />
            <div>
              <p className="font-display text-lg font-semibold">Bhartiya Vidyapeeth</p>
              <p className="text-sm text-primary-foreground/75">Playway School</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/75">{settings.tagline}</p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold tracking-wide text-gold uppercase">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <a className="hover:text-gold" href="#home">
                Home
              </a>
            </li>
            <li>
              <a className="hover:text-gold" href="#gallery">
                Gallery
              </a>
            </li>
            <li>
              <a className="hover:text-gold" href="#admission">
                Admission
              </a>
            </li>
            <li>
              <a className="hover:text-gold" href="#contact">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-gold uppercase">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a className="hover:text-gold" href={`tel:${settings.phoneIntl}`}>
                {settings.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                className="hover:text-gold"
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {settings.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <address className="not-italic">{settings.address}</address>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-primary-foreground/70 sm:px-6">
        <p>
          © {new Date().getFullYear()} {settings.schoolName}. All rights reserved.
        </p>
        <p className="mt-1">
          Designed &amp; Developed by{" "}
          <span className="font-semibold tracking-wide text-gold">AMAN KASHYAP</span> from{" "}
          {SCHOOL.developerUrl ? (
            <a
              href={SCHOOL.developerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold hover:underline"
            >
              TechX Solutions
            </a>
          ) : (
            <span className="font-semibold text-gold">TechX Solutions</span>
          )}
        </p>
      </div>
    </footer>
  );
}
