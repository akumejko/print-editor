"use client";

import { Upload } from "lucide-react";

interface Props {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadPanel({ onUpload }: Props) {
  return (
    <div className="px-4 pb-4 pt-3 border-t border-slate-100">
      <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
        <Upload className="w-5 h-5 text-slate-400" />
        <span className="text-xs text-slate-500 text-center">
          Kliknij, aby wybrać plik<br />(PNG, JPG, SVG)
        </span>
        <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </label>
    </div>
  );
}
