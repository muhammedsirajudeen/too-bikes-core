import { z } from "zod";

export const querySchema = z.object({
  storeId: z.string().min(1, "Store ID is required").optional(),
  startTime: z.string().datetime({ message: "Must be ISO8601 format" }).transform(v => new Date(v)),
  endTime: z.string().datetime({ message: "Must be ISO8601 format" }).transform(v => new Date(v)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  latitude: z.string().transform(Number).pipe(z.number().min(-90).max(90)).optional(),
  longitude: z.string().transform(Number).pipe(z.number().min(-180).max(180)).optional()
}).refine(data => data.endTime > data.startTime, {
  message: "endTime must be after startTime",
  path: ["endTime"]
});