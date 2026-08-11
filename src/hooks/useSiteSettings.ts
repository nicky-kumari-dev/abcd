import { queryOptions, useQuery } from "@tanstack/react-query";

import { logoAsset as bundledLogo } from "@/lib/images";
import { DEFAULT_SETTINGS, getSiteSettings, type SiteSettings } from "@/lib/settings.functions";

export const siteSettingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 5 * 60 * 1000,
});

/** School information from the admin settings panel, with safe built-in defaults. */
export function useSiteSettings(): SiteSettings & { logo: string } {
  const { data } = useQuery({ ...siteSettingsQuery, placeholderData: DEFAULT_SETTINGS });
  const settings = data ?? DEFAULT_SETTINGS;
  return { ...settings, logo: settings.logoUrl ?? bundledLogo.url };
}
