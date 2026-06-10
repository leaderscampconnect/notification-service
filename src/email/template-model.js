import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    textContent: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: "email_templates",
    versionKey: false
  }
);

export const EmailTemplate =
  mongoose.models.EmailTemplate
  || mongoose.model("EmailTemplate", templateSchema);
