import type { D1Bindings } from "@/lib/db/types";

export function getBindings(): D1Bindings {
  const bindings = (globalThis as typeof globalThis & { __cloudflareBindings?: D1Bindings })
    .__cloudflareBindings;

  return bindings ?? {};
}
