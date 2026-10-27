import mongoose, { Schema, models, model } from "mongoose";
import {
  indianStatesAndUnionTerritories,
  supportedLanguageCodes,
} from "../lib/profile-options";
import { businessCategories, type ProfileInput } from "../lib/profile-schema";

const businessProfileSchema = new Schema<ProfileInput>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^(?:\+91[\s-]?)?[6-9]\d{9}$/,
    },
    state: {
      type: String,
      required: true,
      enum: indianStatesAndUnionTerritories,
    },
    district: { type: String, required: true, trim: true, maxlength: 80 },
    village: { type: String, required: true, trim: true, maxlength: 100 },
    preferredLanguage: {
      type: String,
      required: true,
      enum: supportedLanguageCodes,
    },
    businessStatus: {
      type: String,
      required: true,
      enum: ["planning", "operating"],
    },
    businessIdea: { type: String, required: true, trim: true, maxlength: 160 },
    businessCategory: { type: String, required: true, enum: businessCategories },
    availableBudget: { type: Number, required: true, min: 1 },
    experienceLevel: {
      type: String,
      required: true,
      enum: ["beginner", "some", "experienced"],
    },
  },
  { timestamps: true, strict: "throw" },
);

export const BusinessProfile =
  (models.BusinessProfile as mongoose.Model<ProfileInput> | undefined) ??
  model<ProfileInput>("BusinessProfile", businessProfileSchema);
