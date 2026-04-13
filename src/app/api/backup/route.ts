import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Student from "@/models/Student";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

// Backup collection schema
const BackupSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  students: [mongoose.Schema.Types.Mixed],
  transactions: [mongoose.Schema.Types.Mixed],
  counts: {
    students: Number,
    transactions: Number,
  },
});

const Backup =
  mongoose.models.Backup || mongoose.model("Backup", BackupSchema);

export async function GET(request: NextRequest) {
  // Verify cron secret for Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [students, transactions] = await Promise.all([
    Student.find().lean(),
    Transaction.find().sort({ createdAt: -1 }).limit(10000).lean(),
  ]);

  // Store backup in MongoDB
  await Backup.create({
    timestamp: new Date(),
    students,
    transactions,
    counts: {
      students: students.length,
      transactions: transactions.length,
    },
  });

  // Keep only last 48 backups (2 days of hourly)
  const backupCount = await Backup.countDocuments();
  if (backupCount > 48) {
    const oldBackups = await Backup.find()
      .sort({ timestamp: 1 })
      .limit(backupCount - 48)
      .select("_id");
    await Backup.deleteMany({
      _id: { $in: oldBackups.map((b) => b._id) },
    });
  }

  return NextResponse.json({
    message: "Backup completed",
    timestamp: new Date().toISOString(),
    counts: {
      students: students.length,
      transactions: transactions.length,
    },
  });
}
