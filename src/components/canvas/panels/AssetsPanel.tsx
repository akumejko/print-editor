"use client";

import { PRESET_ASSETS } from "@/config/assets";

interface Props {
  onAdd: (src: string) => void;
}

export function AssetsPanel({ onAdd }: Props) {
  return (
    <div className="px-3 pb-3 border-t border-slate-100">
      <div className="grid grid-cols-4 gap-1.5 pt-3">
        {PRESET_ASSETS.map((asset) => (
          <button
            key={asset.id}
            onClick={() => onAdd(asset.src)}
            title={asset.label}
            className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center p-1.5 transition-colors border border-slate-200 hover:border-slate-300"
          >
            <img src={asset.src} alt={asset.label} className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
