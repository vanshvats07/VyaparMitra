import mongoose from "mongoose";

const businessMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: String,
      required: true,
      trim: true,
    },

    sales: {
      type: Number,
      required: true,
      min: 0,
    },

    expenses: {
      type: Number,
      required: true,
      min: 0,
    },

    profit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BusinessMetric =
  mongoose.models.BusinessMetric ||
  mongoose.model("BusinessMetric", businessMetricSchema);

export default BusinessMetric;
