import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveProject } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { dataUrl, productId } = await req.json();

    if (!dataUrl || !productId) {
      return NextResponse.json({ error: "Missing dataUrl or productId" }, { status: 400 });
    }

    const base64 = (dataUrl as string).replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    // Display ID shown to customer (short, memorable)
    const id = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    // Download token never exposed to customer — used in the actual download URL
    const downloadToken = randomUUID();

    saveProject(id, downloadToken, productId, buffer);

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
