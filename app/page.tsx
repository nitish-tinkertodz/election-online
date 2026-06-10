import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAdminHostRequest } from "@/lib/network/request-origin";

export default async function HomePage() {
  const requestHeaders = await headers();

  if (isAdminHostRequest(requestHeaders)) {
    redirect("/admin");
  }

  redirect("/vote");
}
