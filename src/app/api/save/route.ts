import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveProject } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Dzienny limit projektów został osiągnięty. Spróbuj jutro." },
        { status: 429 }
      );
    }

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
