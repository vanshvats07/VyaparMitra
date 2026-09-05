import mongoose from "mongoose";

const governmentSchemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  state: {
    type: String,
    trim: true,
  },

  category: {
    type: String,
    trim: true,
  },

  eligibility: {
    type: [String],
    default: [],
  },

  benefits: {
    type: [String],
    default: [],
  },

  officialUrl: {
    type: String,
    trim: true,
  },

  lastUpdated: {
    type: Date,
  },
});

const GovernmentScheme =
  mongoose.models.GovernmentScheme ||
  mongoose.model("GovernmentScheme", governmentSchemeSchema);

export default GovernmentScheme;