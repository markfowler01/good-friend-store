import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Suggestion from "@/models/Suggestion";
import { getSession } from "@/lib/auth";
import { sendSuggestionToZoho } from "@/lib/zoho-projects";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, pageContext } = await request.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Suggestion text is required" }, { status: 400 });
  }

  await connectDB();

  const suggestion = await Suggestion.create({
    text: text.trim(),
    submittedBy: session.user?.name || "Unknown",
    pageContext: pageContext || "",
    status: "new",
  });

  // Fire-and-forget Zoho forward (doesn't block the user if it fails / isn't configured)
  sendSuggestionToZoho(suggestion).catch((err) => {
    console.error("[suggestions] Zoho forward failed:", err.message);
  });

  return NextResponse.json({ ok: true, id: suggestion._id }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const suggestions = await Suggestion.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(suggestions);
}
