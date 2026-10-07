const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
{
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},

title: {
  type: String,
  required: true,
  trim: true,
},

verdict: {
  type: String,
  enum: ["Real", "Fake", "Unverified"],
  default: "Unverified",
},

mlPrediction: {
  type: String,
  enum: ["Real", "Fake", "Unverified"],
  default: "Unverified",
},

mlConfidence: {
  type: Number,
  default: 0,
},

webVerdict: {
  type: String,
  enum: ["Real", "Fake", "Unverified"],
  default: "Unverified",
},

reason: {
  type: String,
  default: "",
},

confidence: {
  type: Number,
  default: 0,
},

evidenceScore: {
  type: Number,
  default: 0,
},

supportingScore: {
  type: Number,
  default: 0,
},

contradictingScore: {
  type: Number,
  default: 0,
},

supportingPercentage: {
  type: Number,
  default: 0,
},

contradictingPercentage: {
  type: Number,
  default: 0,
},

analysisEngine: {
  type: String,
  default: "Tavily Web Search + Gemini AI",
},

sources: {
  type: Array,
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
