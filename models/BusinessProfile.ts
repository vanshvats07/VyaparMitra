import mongoose, { Schema, models, model } from "mongoose";
import {
  indianStatesAndUnionTerritories,
  supportedLanguageCodes,
} from "../lib/profile-options";
import {
  businessCategories,
  type PlanningTask,
  type ProfileInput,
} from "../lib/profile-schema";

type BusinessProfileRecord = ProfileInput & {
  planningTasks?: PlanningTask[];
};

const planningTaskSchema = new Schema<PlanningTask>(
  {
    id: { type: String, required: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    completed: { type: Boolean, required: true, default: false },
  },
  { _id: false, strict: "throw" },
);

const businessProfileSchema = new Schema<BusinessProfileRecord>(
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
    planningTasks: {
      type: [planningTaskSchema],
      default: [],
      validate: {
        validator: (tasks: PlanningTask[]) => tasks.length <= 30,
        message: "A business plan can contain no more than 30 tasks.",
      },
    },
  },
  { timestamps: true, strict: "throw" },
);

export const BusinessProfile =
  (models.BusinessProfile as mongoose.Model<BusinessProfileRecord> | undefined) ??
  model<BusinessProfileRecord>("BusinessProfile", businessProfileSchema);
