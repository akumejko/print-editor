"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  projectId: string;
  copied: boolean;
  onCopy: () => void;
}

export function ProjectIdBanner({ projectId, copied, onCopy }: Props) {
  return (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-green-800">Projekt zapisany!</p>
        <p className="text-xs text-green-600 mt-0.5">
          Twój kod projektu:{" "}
          <span className="font-mono font-bold text-lg text-green-900">{projectId}</span>
        </p>
        <p className="text-xs text-green-600 mt-1">
          Zanotuj ten kod — będzie potrzebny do odbioru wydruku.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
        className="shrink-0 border-green-300 text-green-700 hover:bg-green-100"
      >
        {copied ? (
          <><Check className="w-3.5 h-3.5 mr-1" /> Skopiowano</>
        ) : (
          <><Copy className="w-3.5 h-3.5 mr-1" /> Kopiuj</>
        )}
      </Button>
    </div>
  );
}
