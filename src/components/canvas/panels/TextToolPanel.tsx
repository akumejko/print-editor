"use client";

import { useState } from "react";
import { Type, Bold, Italic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONTS } from "@/config/assets";
import type { AddTextParams } from "../hooks/useFabricCanvas";

interface Props {
  onAdd: (params: AddTextParams) => void;
}

export function TextToolPanel({ onAdd }: Props) {
  const [textInput, setTextInput] = useState("Twój tekst");
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [color, setColor] = useState("#000000");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  return (
    <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
      <div className="pt-3">
        <Label className="text-xs text-slate-500 mb-1 block">Treść</Label>
        <Input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Wpisz tekst..."
          className="text-sm"
        />
      </div>
      <div>
        <Label className="text-xs text-slate-500 mb-1 block">Czcionka</Label>
        <Select value={fontFamily} onValueChange={(v) => v && setFontFamily(v)}>
          <SelectTrigger className="text-sm h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-slate-500 mb-1 block">Rozmiar</Label>
          <Input
            type="number"
            min={8}
            max={200}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="text-sm h-8"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1 block">Kolor</Label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setBold((b) => !b)}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-sm border transition-colors ${bold ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
        >
          <Bold className="w-3.5 h-3.5" /> Pogrubienie
        </button>
        <button
          onClick={() => setItalic((i) => !i)}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-sm border transition-colors ${italic ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
        >
          <Italic className="w-3.5 h-3.5" /> Kursywa
        </button>
      </div>
      <Button
        onClick={() => onAdd({ text: textInput, fontSize, fontFamily, color, bold, italic })}
        className="w-full h-8 text-sm"
      >
        <Type className="w-3.5 h-3.5 mr-1.5" /> Dodaj tekst
      </Button>
    </div>
  );
}
