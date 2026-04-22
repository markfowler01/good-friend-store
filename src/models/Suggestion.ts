import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISuggestion extends Document {
  text: string;
  submittedBy?: string;
  pageContext?: string;
  status: "new" | "in-progress" | "done" | "skipped";
  zohoTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    submittedBy: { type: String, trim: true },
    pageContext: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "in-progress", "done", "skipped"],
      default: "new",
    },
    zohoTaskId: { type: String, trim: true },
  },
  { timestamps: true }
);

SuggestionSchema.index({ status: 1, createdAt: -1 });

const Suggestion: Model<ISuggestion> =
  mongoose.models.Suggestion || mongoose.model<ISuggestion>("Suggestion", SuggestionSchema);

export default Suggestion;
