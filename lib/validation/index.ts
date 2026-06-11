import { z } from "zod";

import { ELECTION_STATUSES } from "@/lib/election/status";

export const roleStatusSchema = z.enum(["Active", "Inactive"]);
export const candidateStatusSchema = z.enum(["Active", "Inactive"]);
export const electionStatusSchema = z.enum(ELECTION_STATUSES);
export const finalResultStatusSchema = z.enum(["DRAFT", "FINAL", "ARCHIVED"]);

export const roleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(280).optional().or(z.literal("")),
  display_order: z.number().int().nonnegative(),
  status: roleStatusSchema
});

export const candidateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  class_name: z.string().trim().max(40).optional().default(""),
  role_id: z.string().trim().min(1),
  photo_url: z.string().trim().max(500).optional().or(z.literal("")),
  status: candidateStatusSchema
});

export const brandingSchema = z.object({
  school_name: z.string().trim().min(1).max(140),
  school_logo_url: z.string().url().optional().or(z.literal(""))
});

export const voteSubmissionSchema = z.object({
  role_id: z.string().trim().min(1),
  candidate_id: z.string().trim().min(1)
});

export const photoUploadSchema = z.object({
  contentType: z.string().trim().min(1),
  sizeInBytes: z.number().int().positive().max(5 * 1024 * 1024)
});
