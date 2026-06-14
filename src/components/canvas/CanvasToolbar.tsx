"use client";

import { Loader2, Redo2, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/config/products";

interface Props {
  product: Product;
  canUndo: boolean;
  canRedo: boolean;
  saving: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
}

export function CanvasToolbar({ product, canUndo, canRedo, saving, onUndo, onRedo, onSave }: Props) {
  return (
    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
        Strefa nadruku — {product.printWidthMm}×{product.printHeightMm} mm
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Cofnij (Ctrl+Z)"
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Ponów (Ctrl+Y)"
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <Button onClick={onSave} disabled={saving} className="h-8 text-sm">
          {saving ? (
            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Zapisuję…</>
          ) : (
            <><Save className="w-3.5 h-3.5 mr-1.5" /> Zapisz projekt</>
          )}
        </Button>
      </div>
    </div>
  );
}
