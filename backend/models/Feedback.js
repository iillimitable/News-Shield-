const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Verification",
      default: null,
    },
    verificationResult: {
      type: String,
      enum: ["Real", "Fake", "Unverified"],
      default: "Unverified",
    },
    helpful: {
      type: Boolean,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    category: {
      type: String,
      enum: [
        "Correct result",
        "Incorrect result",
        "Unclear explanation",
        "Insufficient evidence",
        "Irrelevant sources",
        "Other",
      ],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ verificationId: 1, userId: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
