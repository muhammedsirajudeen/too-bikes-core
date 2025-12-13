import { z } from "zod";

export const querySchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  startTime: z.string().datetime({ message: "Must be ISO8601 format" }).transform(v => new Date(v)),
  endTime: z.string().datetime({ message: "Must be ISO8601 format" }).transform(v => new Date(v)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
}).refine(data => data.endTime > data.startTime, {
  message: "endTime must be after startTime",
  path: ["endTime"]
});