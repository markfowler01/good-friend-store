import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const filter: Record<string, unknown> = { studentId: params.id };
  if (type) filter.type = type;
  if (from || to) {
    filter.serviceDate = {};
    if (from) (filter.serviceDate as Record<string, unknown>).$gte = new Date(from);
    if (to) (filter.serviceDate as Record<string, unknown>).$lte = new Date(to);
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("recordedBy", "name")
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return NextResponse.json({
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
