import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    village: {
      type: String,
      trim: true,
    },

    businessIdea: {
      type: String,
      required: true,
      trim: true,
    },

    businessCategory: {
      type: String,
      trim: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    experience: {
      type: String,
      trim: true,
    },

    language: {
      type: String,
      enum: ["hi", "en"],
      default: "hi",
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;