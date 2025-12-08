import { IFAQ } from "@/core/interface/model/IFaq.model";
import { Schema, model, models } from "mongoose";

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const FAQModel = models.FAQ || model<IFAQ>("FAQ", FAQSchema);
