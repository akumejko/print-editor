import { NextRequest, NextResponse } from "next/server";
import { getDownloadToken } from "@/lib/db";

interface Props {
  params: Promise<{ displayId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  // Protect with ADMIN_SECRET env var
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 500 });
  }

  const key = req.nextUrl.searchParams.get("key");
  if (key !== adminSecret) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { displayId } = await params;
  const token = getDownloadToken(displayId);

  if (!token) {
    return NextResponse.json(
      { error: `Projekt o kodzie ${displayId.toUpperCase()} nie istnieje` },
      { status: 404 }
    );
  }

  const host = req.nextUrl.origin;
  const downloadUrl = `${host}/api/download/${token}`;

  // Redirect straight to the file for convenience
  return NextResponse.redirect(downloadUrl);
}
