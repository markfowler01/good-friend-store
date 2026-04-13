import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, type, amount, reason, serviceDate } = await request.json();

  if (!studentId || !type || !amount || !reason) {
    return NextResponse.json(
      { error: "studentId, type, amount, and reason are required" },
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

  // Find student by _id or uniqueId
  let student;
  if (mongoose.Types.ObjectId.isValid(studentId)) {
    student = await Student.findById(studentId);
  } else {
    student = await Student.findOne({ uniqueId: studentId });
  }

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Validate sufficient balance for redemptions
  if (type === "redeem" && student.ticketBalance < amount) {
    return NextResponse.json(
      {
        error: `Insufficient balance. Student has ${student.ticketBalance} tickets.`,
      },
      { status: 400 }
    );
  }

  // Atomic: create transaction + update balance
  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();

    const [transaction] = await Transaction.create(
      [
        {
          studentId: student._id,
          type,
          amount,
          reason,
          serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
          recordedBy: session.user.name || "Unknown",
        },
      ],
      { session: dbSession }
    );

    const balanceChange = type === "earn" ? amount : -amount;
    await Student.findByIdAndUpdate(
      student._id,
      { $inc: { ticketBalance: balanceChange } },
      { session: dbSession }
    );

    await dbSession.commitTransaction();

    return NextResponse.json(
      {
        transaction,
        newBalance: student.ticketBalance + balanceChange,
      },
      { status: 201 }
    );
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type");

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("studentId", "name uniqueId grade")
    .lean();

  return NextResponse.json(transactions);
}
