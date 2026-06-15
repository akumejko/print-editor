"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { TermsModal } from "../TermsModal";

interface Props {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadPanel({ onUpload }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="px-4 pb-4 pt-3 border-t border-slate-100 space-y-3">
      <div className="flex items-start gap-2">
        <input
          id="terms-checkbox"
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-slate-900 cursor-pointer"
        />
        <label htmlFor="terms-checkbox" className="text-xs text-slate-600 leading-snug cursor-pointer">
          Akceptuję{" "}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-blue-600 hover:underline font-medium"
          >
            regulamin przesyłania plików
          </button>
        </label>
      </div>

      <label
        className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors ${
          accepted
            ? "border-slate-300 cursor-pointer hover:bg-slate-50"
            : "border-slate-200 opacity-40 cursor-not-allowed"
        }`}
      >
        <Upload className="w-5 h-5 text-slate-400" />
        <span className="text-xs text-slate-500 text-center">
          Kliknij, aby wybrać plik<br />(PNG, JPG, SVG)
        </span>
        <input
          type="file"
          accept="image/*"
          disabled={!accepted}
          onChange={onUpload}
          className="hidden"
        />
      </label>

      {modalOpen && <TermsModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
