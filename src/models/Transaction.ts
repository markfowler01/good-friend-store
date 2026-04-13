import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITransaction extends Document {
  studentId: Types.ObjectId;
  type: "earn" | "redeem";
  amount: number;
  reason: string;
  serviceDate: Date;
  recordedBy: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    type: {
      type: String,
      enum: ["earn", "redeem"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    serviceDate: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TransactionSchema.index({ studentId: 1, createdAt: -1 });
TransactionSchema.index({ serviceDate: 1 });
TransactionSchema.index({ type: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
