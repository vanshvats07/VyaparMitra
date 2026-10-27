import mongoose, { Schema, model, models, type Types } from "mongoose";

type ProfileSessionRecord = {
  profileId: Types.ObjectId;
  sessionTokenHash: string;
  expiresAt: Date;
};

const profileSessionSchema = new Schema<ProfileSessionRecord>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
    },
    sessionTokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, strict: "throw" },
);

profileSessionSchema.index({ sessionTokenHash: 1 }, { unique: true });
profileSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ProfileSession =
  (models.ProfileSession as mongoose.Model<ProfileSessionRecord> | undefined) ??
  model<ProfileSessionRecord>("ProfileSession", profileSessionSchema);
