import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { About } from "@/components/site/About";
import { AdmissionSection } from "@/components/site/AdmissionSection";
import { ContactSection } from "@/components/site/ContactSection";
import { GallerySection } from "@/components/site/GallerySection";
import { Hero } from "@/components/site/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { siteSettingsQuery } from "@/hooks/useSiteSettings";
import { getGallery } from "@/lib/gallery.functions";
import { SCHOOL } from "@/lib/school";

const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => getGallery(),
});

const TITLE = "Bhartiya Vidyapeeth Playway School | Best Play School in Sikanderpur, Ballia";
const DESCRIPTION =
  "Bhartiya Vidyapeeth Playway School, Sikanderpur, Ballia — joyful play-way learning for Play Group, NUR, LKG and UKG with smart classes, CCTV safety and caring teachers. Admission open.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(galleryQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "playway school Ballia, best play school Sikanderpur, nursery school Ballia, LKG school Ballia, kindergarten Ballia, play way school Uttar Pradesh",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["School", "LocalBusiness"],
              name: SCHOOL.name,
              description: DESCRIPTION,
              telephone: SCHOOL.phoneIntl,
              url: "/",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Milky Mohalla, Plot No. 27",
                addressLocality: SCHOOL.locality,
                addressRegion: SCHOOL.region,
                postalCode: SCHOOL.postalCode,
                addressCountry: "IN",
              },
              openingHours: "Mo-Sa 09:00-14:00",
              hasMap: SCHOOL.mapLink,
            },
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: gallery } = useSuspenseQuery(galleryQuery);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <GallerySection items={gallery} />
        <AdmissionSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
