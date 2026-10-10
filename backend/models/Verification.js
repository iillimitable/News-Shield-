
const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    // User who verified the news
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Original news claim
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Final AI + evidence verdict
    verdict: {
      type: String,
      enum: ["Real", "Fake", "Unverified"],
      default: "Unverified",
    },

    // Supporting ML prediction
    mlPrediction: {
      type: String,
      enum: ["Real", "Fake", "Unverified"],
      default: "Unverified",
    },

    mlConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Verdict based on web evidence analysis
    webVerdict: {
      type: String,
      enum: ["Real", "Fake", "Unverified"],
      default: "Unverified",
    },

    // Explanation of the verification result
    reason: {
      type: String,
      default: "",
      trim: true,
    },

    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Evidence scores
    evidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    supportingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    contradictingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    supportingPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    contradictingPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Verification technology used
    analysisEngine: {
      type: String,
      default: "Tavily Web Search + Groq AI",
    },

    // Web evidence sources
    sources: {
      type: [
        {
          title: { type: String, default: "" },
          url: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Verification",
  verificationSchema
);
