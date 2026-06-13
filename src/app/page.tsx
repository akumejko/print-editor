import Link from "next/link";
import { PRODUCTS } from "@/config/products";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ProductImage";
import { Printer } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Kreator Nadruku</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Zaprojektuj swój nadruk
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Wybierz produkt, dodaj tekst lub grafikę, a my zajmiemy się drukiem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/editor/${product.id}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 hover:-translate-y-1">
                <div className={`${product.color} flex items-center justify-center h-52 p-6`}>
                  <ProductImage
                    src={product.mockupImage}
                    alt={product.name}
                    className="object-contain h-full w-auto drop-shadow-md"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {product.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {product.printWidthMm}×{product.printHeightMm} mm
                    </Badge>
                    <span className="text-sm font-medium text-slate-900 group-hover:underline">
                      Zaprojektuj →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            Masz już projekt?{" "}
            <span className="font-medium text-slate-700">
              Podaj mi swój kod projektu, a wydrukuję go dla Ciebie.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
