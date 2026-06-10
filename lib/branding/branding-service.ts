import { queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";

export type SchoolBranding = {
  school_name: string;
  school_logo_url: string;
};

const DEFAULT_SCHOOL_NAME = "School Election Voting System";

export async function isSchoolBrandingConfigured(): Promise<boolean> {
  try {
    const rows = await queryAll<{ key: string; value: string }>(
      getBindings(),
      "SELECT key, value FROM settings WHERE key IN (?, ?);",
      ["school_name", "school_logo_url"]
    );

    const schoolName = rows.find((row) => row.key === "school_name")?.value ?? DEFAULT_SCHOOL_NAME;
    const schoolLogoUrl = rows.find((row) => row.key === "school_logo_url")?.value ?? "";

    return schoolName.trim() !== DEFAULT_SCHOOL_NAME || schoolLogoUrl.trim() !== "";
  } catch {
    return false;
  }
}

export async function getSchoolBranding(): Promise<SchoolBranding> {
  try {
    const rows = await queryAll<{ key: string; value: string }>(
      getBindings(),
      "SELECT key, value FROM settings WHERE key IN (?, ?);",
      ["school_name", "school_logo_url"]
    );

    return {
      school_name:
        rows.find((row) => row.key === "school_name")?.value ??
        DEFAULT_SCHOOL_NAME,
      school_logo_url: rows.find((row) => row.key === "school_logo_url")?.value ?? ""
    };
  } catch {
    return {
      school_name: DEFAULT_SCHOOL_NAME,
      school_logo_url: ""
    };
  }
}
