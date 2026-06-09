import type { ReactNode } from "react";

import { requireAdminAccess } from "@/lib/auth/admin";

type ResultsLayoutProps = {
  children: ReactNode;
};

export default async function ResultsLayout({ children }: ResultsLayoutProps) {
  await requireAdminAccess("/results");
  return children;
}
