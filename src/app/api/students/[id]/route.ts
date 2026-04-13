import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

async function findStudent(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Student.findById(id);
  }
  return Student.findOne({ uniqueId: id });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const student = await findStudent(params.id);

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await request.json();
  const allowed = ["name", "grade", "isActive"];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) {
      filtered[key] = updates[key];
    }
  }

  await connectDB();
  const student = await Student.findByIdAndUpdate(params.id, filtered, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const student = await Student.findByIdAndUpdate(
    params.id,
    { isActive: false },
    { new: true }
  );

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Student deactivated" });
}
