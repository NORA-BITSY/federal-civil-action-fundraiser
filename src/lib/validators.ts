import { z } from "zod";
import { CampaignCategory } from "@prisma/client";

export const createCampaignSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(30),
  shortDescription: z.string().min(10).max(280),
  goalAmount: z.number().positive().finite().max(9_999_999),
  category: z.nativeEnum(CampaignCategory).optional(),
  caseNumber: z.string().trim().optional().nullable(),
  courtName: z.string().trim().optional().nullable(),
  attorneyName: z.string().trim().optional().nullable(),
  attorneyContact: z.string().trim().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).max(24).optional().default([]),
});

export const donationSchema = z.object({
  amount: z.number().positive().finite().max(1_000_000),
  isAnonymous: z.boolean().optional().default(false),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type DonationInput = z.infer<typeof donationSchema>;
