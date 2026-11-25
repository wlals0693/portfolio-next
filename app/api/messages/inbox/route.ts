import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MessageModel } from "@/lib/models";
import { databaseRequired, failure } from "@/lib/api";
import { requireAdmin } from "@/lib/permissions";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    databaseRequired();
    await connectDB();
    const page =
      Number.isSafeInteger(body.page) && body.page > 0
        ? Math.min(body.page, 100000)
        : 1;
    const limit = 20;
    const [docs, total] = await Promise.all([
      MessageModel.find()
        .select("name email content createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MessageModel.countDocuments(),
    ]);
    return NextResponse.json(
      {
        messages: docs.map((doc) => ({
          id: String(doc._id),
          name: doc.name,
          email: doc.email,
          content: doc.content,
          createdAt: new Date(doc.createdAt).toISOString(),
        })),
        page,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
