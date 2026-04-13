import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentIds, amount, reason, serviceDate } = await request.json();

  if (!studentIds?.length || !amount || !reason) {
    return NextResponse.json(
      { error: "studentIds, amount, and reason are required" },
      { status: 400 }
    );
  }

  if (amount < 1) {
    return NextResponse.json(
      { error: "Amount must be at least 1" },
      { status: 400 }
    );
  }

  await connectDB();

  const date = serviceDate ? new Date(serviceDate) : new Date();

  // Create transactions for all students
  const transactionDocs = studentIds.map((id: string) => ({
    studentId: id,
    type: "earn" as const,
    amount,
    reason,
    serviceDate: date,
    recordedBy: session.user.name || "Unknown",
  }));

  await Transaction.insertMany(transactionDocs);

  // Bulk update all student balances
  await Student.updateMany(
    { _id: { $in: studentIds } },
    { $inc: { ticketBalance: amount } }
  );

  return NextResponse.json(
    {
      message: `Added ${amount} tickets to ${studentIds.length} students`,
      count: studentIds.length,
    },
    { status: 201 }
  );
}
