import { IFAQ } from "@/core/interface/model/IFaq.model";
import mongoose, { Schema } from "mongoose";

const FAQSchema: Schema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const FAQModel = mongoose.models.FAQ || mongoose.model<IFAQ>("FAQS", FAQSchema);
