import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth";
import { getQuarterDateRange } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const quarter = searchParams.get("quarter");
  const grade = searchParams.get("grade");

  let dateFilter: Record<string, unknown> = {};
  if (quarter) {
    const { start, end } = getQuarterDateRange(quarter);
    dateFilter = { serviceDate: { $gte: start, $lte: end } };
  }

  // Get all active students
  const studentFilter: Record<string, unknown> = { isActive: true };
  if (grade) studentFilter.grade = grade;
  const students = await Student.find(studentFilter).lean();

  const studentIds = students.map((s) => s._id);

  // Aggregate transactions by student
  const aggregation = await Transaction.aggregate([
    {
      $match: {
        studentId: { $in: studentIds },
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: { studentId: "$studentId", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Build student report data
  const studentMap = new Map<string, { earned: number; redeemed: number; earnCount: number; redeemCount: number }>();
  for (const item of aggregation) {
    const id = item._id.studentId.toString();
    if (!studentMap.has(id)) {
      studentMap.set(id, { earned: 0, redeemed: 0, earnCount: 0, redeemCount: 0 });
    }
    const entry = studentMap.get(id)!;
    if (item._id.type === "earn") {
      entry.earned = item.total;
      entry.earnCount = item.count;
    } else {
      entry.redeemed = item.total;
      entry.redeemCount = item.count;
    }
  }

  const report = students.map((s) => {
    const data = studentMap.get(s._id.toString()) || { earned: 0, redeemed: 0, earnCount: 0, redeemCount: 0 };
    return {
      _id: s._id,
      name: s.name,
      grade: s.grade,
      barcodeId: s.barcodeId ?? null,
      currentBalance: s.ticketBalance,
      earned: data.earned,
      redeemed: data.redeemed,
      earnCount: data.earnCount,
      redeemCount: data.redeemCount,
    };
  });

  // Grade summaries
  const gradeSummary: Record<string, { earned: number; redeemed: number; students: number }> = {};
  for (const r of report) {
    const key = r.grade ?? "Ungraded";
    if (!gradeSummary[key]) {
      gradeSummary[key] = { earned: 0, redeemed: 0, students: 0 };
    }
    gradeSummary[key].earned += r.earned;
    gradeSummary[key].redeemed += r.redeemed;
    gradeSummary[key].students += 1;
  }

  const totalEarned = report.reduce((sum, r) => sum + r.earned, 0);
  const totalRedeemed = report.reduce((sum, r) => sum + r.redeemed, 0);

  return NextResponse.json({
    students: report,
    gradeSummary,
    totals: {
      earned: totalEarned,
      redeemed: totalRedeemed,
      activeStudents: students.length,
    },
  });
}
