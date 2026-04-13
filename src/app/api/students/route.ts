import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const grade = searchParams.get("grade");
  const sort = searchParams.get("sort") || "name";
  const active = searchParams.get("active") !== "false";

  const filter: Record<string, unknown> = { isActive: active };
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (grade) {
    filter.grade = grade;
  }

  const sortOption: Record<string, 1 | -1> =
    sort === "balance" ? { ticketBalance: -1 } : { name: 1 };

  const students = await Student.find(filter).sort(sortOption).lean();

  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, grade, startingTickets } = await request.json();

  if (!name || !grade) {
    return NextResponse.json(
      { error: "Name and grade are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const student = await Student.create({
    name,
    grade,
    ticketBalance: startingTickets || 0,
  });
  return NextResponse.json(student, { status: 201 });
}
