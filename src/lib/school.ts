/** Static school information used across the site. */
export const SCHOOL = {
  name: "Bhartiya Vidyapeeth Playway School",
  tagline: "Second home cum school of your child",
  address: "Milky Mohalla, Plot No. 27, Sikanderpur, Ballia, Uttar Pradesh – 277303",
  locality: "Sikanderpur",
  region: "Uttar Pradesh",
  postalCode: "277303",
  phone: "7905817399",
  phoneIntl: "+917905817399",
  whatsapp: "917905817399",
  mapLink: "https://maps.app.goo.gl/N33iw3Tbcoda2siG6?g_st=ac",
  mapEmbed:
    "https://www.google.com/maps?q=Bhartiya%20Vidyapeeth%20Play%20Way%20School%2C%20Milky%20Mohalla%2C%20Sikanderpur%2C%20Ballia%2C%20Uttar%20Pradesh%20277303&output=embed",
  timings: "Monday – Saturday, 9:00 AM to 2:00 PM",
  /**
   * Developer credit link shown in the footer. Left blank on purpose: the
   * previous value pointed at a Lovable-hosted preview URL
   * (techxsolution.lovable.app), which cannot ship in production. Set this to
   * TechX Solutions' real domain once you have one; until then the footer
   * shows the credit as plain text instead of a link.
   */
  developerUrl: "",
} as const;

export const CLASSES = ["Play Group", "NUR", "LKG", "UKG"] as const;
export type SchoolClass = (typeof CLASSES)[number];

export const CLASS_AGES: Record<SchoolClass, string> = {
  "Play Group": "2–3 Years",
  NUR: "3+ Years",
  LKG: "4+ Years",
  UKG: "5+ Years",
};

/**
 * Classes covered by the online Lectures system (Nursery through Class 12),
 * kept separate from `CLASSES` above: the school only admits students up to
 * UKG, but the principal wants lecture links managed for the full range.
 * Play Group is intentionally excluded — it has no lecture section.
 */
export const LECTURE_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
] as const;
export type LectureClass = (typeof LECTURE_CLASSES)[number];

/** Maps an enrolled student's admission class to their lecture class. Play Group has no lectures, so this returns null for it. */
export function lectureClassFor(studentClass: SchoolClass): LectureClass | null {
  switch (studentClass) {
    case "NUR":
      return "Nursery";
    case "LKG":
      return "LKG";
    case "UKG":
      return "UKG";
    default:
      return null;
  }
}

/** Opens WhatsApp with a pre-filled message. */
export function openWhatsApp(message: string, phone: string = SCHOOL.whatsapp) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Builds the internal login email for a parent phone number. */
export function phoneToEmail(phone: string) {
  return `${phone.replace(/\D/g, "")}@bvps.parent.local`;
}

export const ADMIN_EMAIL = "bvpws@gmail.com";
