import { z } from "zod";

import { ELECTION_STATUSES } from "@/lib/election/status";

export const roleStatusSchema = z.enum(["Active", "Inactive"]);
export const candidateStatusSchema = z.enum(["Active", "Inactive"]);
export const electionStatusSchema = z.enum(ELECTION_STATUSES);
export const finalResultStatusSchema = z.enum(["DRAFT", "FINAL", "ARCHIVED"]);
export const electionScopeTypeSchema = z.enum(["SCHOOL", "CLASS"]);

export const roleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(280).optional().or(z.literal("")),
  display_order: z.number().int().nonnegative(),
  status: roleStatusSchema,
  is_class_leader: z.boolean().optional().default(false)
});

export const candidateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  class_name: z.string().trim().min(1).max(40),
  role_id: z.string().trim().min(1),
  class_id: z.string().trim().optional().or(z.literal("")),
  division_id: z.string().trim().optional().or(z.literal("")),
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

export const classSchema = z.object({
  name: z.string().trim().min(1).max(80),
  display_order: z.number().int().nonnegative(),
  status: roleStatusSchema
});

export const divisionSchema = z.object({
  class_id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(80),
  display_order: z.number().int().nonnegative(),
  status: roleStatusSchema
});

export const studentProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  class_id: z.string().trim().min(1),
  division_id: z.string().trim().optional().or(z.literal(""))
});

export const photoUploadSchema = z.object({
  contentType: z.string().trim().min(1),
  sizeInBytes: z.number().int().positive().max(5 * 1024 * 1024)
});
