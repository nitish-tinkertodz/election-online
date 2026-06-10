import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { SiteHeader } from "@/components/shared/site-header";
import { getSchoolBranding } from "@/lib/branding/branding-service";

export const metadata: Metadata = {
  title: "School Election Voting System",
  description: "Online election management and voting for schools."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const branding = await getSchoolBranding();

  return (
    <html lang="en">
      <body>
        <SiteHeader
          schoolName={branding.school_name}
          schoolLogoUrl={branding.school_logo_url}
        />
        {children}
      </body>
    </html>
  );
}
