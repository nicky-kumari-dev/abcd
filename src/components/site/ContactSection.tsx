import { MapPin, MessageCircle, Phone, Clock, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/** Contact details, map and quick-action buttons. */
export function ContactSection() {
  const settings = useSiteSettings();

  return (
    <section id="contact" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Contact</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary-deep sm:text-4xl">
            Visit Us or Give Us a Call
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-4 rounded-3xl bg-card p-5 shadow-card">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-primary-deep">Phone</h3>
                <a
                  className="text-sm text-muted-foreground hover:text-primary"
                  href={`tel:${settings.phoneIntl}`}
                >
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="flex gap-4 rounded-3xl bg-card p-5 shadow-card">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-primary-deep">WhatsApp</h3>
                <a
                  className="text-sm text-muted-foreground hover:text-primary"
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="flex gap-4 rounded-3xl bg-card p-5 shadow-card">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-primary-deep">Address</h3>
                <address className="text-sm text-muted-foreground not-italic">
                  {settings.address}
                </address>
              </div>
            </div>

            <div className="flex gap-4 rounded-3xl bg-card p-5 shadow-card">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold-foreground">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-primary-deep">School Timings</h3>
                <p className="text-sm text-muted-foreground">{settings.timings}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button asChild className="rounded-full">
                <a href={`tel:${settings.phoneIntl}`}>
                  <Phone className="mr-1 h-4 w-4" /> Call Now
                </a>
              </Button>
              <Button
                asChild
                className="rounded-full bg-success text-success-foreground hover:bg-success/90"
              >
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <a href={settings.mapLink} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-1 h-4 w-4" /> Open Map
                </a>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-soft">
            <iframe
              title={`Location of ${settings.schoolName}`}
              src={settings.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[340px] w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
