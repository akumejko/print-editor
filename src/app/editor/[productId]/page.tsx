import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/config/products";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { ArrowLeft, Printer } from "lucide-react";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function EditorPage({ params }: Props) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Wybór produktu
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <Printer className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-900">Kreator Nadruku</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm font-semibold text-slate-900">{product.name}</span>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6">
        <CanvasEditor product={product} />
      </main>
    </div>
  );
}

export function generateStaticParams() {
  return [
    { productId: "mug-ceramic" },
    { productId: "cup-plastic" },
    { productId: "bottle-sport" },
  ];
}
