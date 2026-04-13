import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Student from "@/models/Student";
import Transaction from "@/models/Transaction";

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

  const backup = {
    timestamp: new Date().toISOString(),
    students,
    transactions,
    counts: {
      students: students.length,
      transactions: transactions.length,
    },
  };

  return NextResponse.json(backup);
}
