import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IStudent extends Document {
  name: string;
  grade: string;
  uniqueId: string;
  ticketBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      enum: ["K", "1", "2", "3", "4", "5"],
    },
    uniqueId: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(3).toString("hex").toUpperCase(),
    },
    ticketBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.index({ uniqueId: 1 });
StudentSchema.index({ name: 1 });
StudentSchema.index({ grade: 1, isActive: 1 });

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
