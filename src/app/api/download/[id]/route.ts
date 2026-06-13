import { NextRequest, NextResponse } from "next/server";
import { getProjectPathByToken } from "@/lib/db";
import fs from "fs";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;

  let filePath: string | null = null;
  try {
    filePath = getProjectPathByToken(id);
  } catch {
    return notFound(id);
  }

  if (!filePath || !fs.existsSync(filePath)) {
    return notFound(id);
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="projekt.png"`,
      "Content-Length": String(buffer.length),
    },
  });
}

function notFound(id: string) {
  return new NextResponse(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Projekt nie znaleziony</title>
    <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;color:#1e293b}
    h1{font-size:2rem;margin-bottom:.5rem}p{color:#64748b}code{background:#f1f5f9;padding:.2em .4em;border-radius:.3em;font-size:1.1em}a{color:#0f172a;margin-top:1.5rem;display:inline-block}</style>
    </head><body><h1>404</h1><p>Projekt o kodzie <code>${id}</code> nie istnieje lub wygasł.</p>
    <a href="/">← Powrót do kreatora</a></body></html>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
