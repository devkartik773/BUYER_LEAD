import { z } from "zod";

// Define the enums for validation
const CityEnum = z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]);
const PropertyTypeEnum = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]);
const BhkEnum = z.enum(["1", "2", "3", "4", "Studio"]);
const PurposeEnum = z.enum(["Buy", "Rent"]);
const TimelineEnum = z.enum(["0-3m", "3-6m", ">6m", "Exploring"]);
const SourceEnum = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]);
const StatusEnum = z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]);

export const buyerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(80, { message: "Full name cannot exceed 80 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/, { message: "Phone number must be 10-15 digits." }),
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: z.string().optional(),
  purpose: PurposeEnum,
  budgetMin: z.coerce.number().int().min(0, { message: "Budget must be a positive number." }).optional().or(z.literal("")),
  budgetMax: z.coerce.number().int().min(0, { message: "Budget must be a positive number." }).optional().or(z.literal("")),
  timeline: TimelineEnum,
  source: SourceEnum,
  notes: z.string().max(1000, { message: "Notes cannot exceed 1,000 characters." }).optional().or(z.literal("")),
  tags: z.string().optional(),
  status: StatusEnum.default("New"),
}).refine((data) => {
  // Custom validation for conditional fields
  if (data.propertyType === "Apartment" || data.propertyType === "Villa") {
    return !!data.bhk && BhkEnum.safeParse(data.bhk).success;
  }
  return true;
}, {
  message: "BHK is required for Apartment or Villa property types.",
  path: ["bhk"],
}).refine((data) => {
  // Custom validation for budgetMin and budgetMax
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: "Max budget must be greater than or equal to min budget.",
  path: ["budgetMax"],
});