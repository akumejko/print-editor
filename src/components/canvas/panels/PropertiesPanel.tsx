"use client";

import { useEffect, useState } from "react";
import { Trash2, RotateCcw, Bold, Italic } from "lucide-react";
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
import type { SelectedObjState } from "../types";

interface Props {
  selectedObj: SelectedObjState;
  onUpdate: (props: Partial<{
    fontSize: number; fontFamily: string; fill: string;
    angle: number; bold: boolean; italic: boolean; opacity: number;
  }>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({ selectedObj, onUpdate, onDelete }: Props) {
  const [angle, setAngle] = useState(selectedObj.angle ?? 0);
  const [opacity, setOpacity] = useState(selectedObj.opacity ?? 100);
  const [fontSize, setFontSize] = useState(selectedObj.fontSize ?? 36);
  const [fontFamily, setFontFamily] = useState(selectedObj.fontFamily ?? "Inter");
  const [fill, setFill] = useState(selectedObj.fill ?? "#000000");
  const [bold, setBold] = useState(selectedObj.bold ?? false);
  const [italic, setItalic] = useState(selectedObj.italic ?? false);

  useEffect(() => {
    setAngle(selectedObj.angle ?? 0);
    setOpacity(selectedObj.opacity ?? 100);
    setFontSize(selectedObj.fontSize ?? 36);
    setFontFamily(selectedObj.fontFamily ?? "Inter");
    setFill(selectedObj.fill ?? "#000000");
    setBold(selectedObj.bold ?? false);
    setItalic(selectedObj.italic ?? false);
  }, [selectedObj]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Właściwości</span>
        <button
          onClick={onDelete}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Usuń"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <Label className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3" /> Kąt (°)
        </Label>
        <Input
          type="number"
          min={-360}
          max={360}
          value={angle}
          onChange={(e) => {
            const v = Number(e.target.value);
            setAngle(v);
            onUpdate({ angle: v });
          }}
          className="text-sm h-8"
        />
      </div>

      <div>
        <Label className="text-xs text-slate-500 mb-1 block">Przezroczystość (%)</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => {
            const v = Number(e.target.value);
            setOpacity(v);
            onUpdate({ opacity: v });
          }}
          className="text-sm h-8"
        />
      </div>

      {selectedObj.type === "text" && (
        <>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Czcionka</Label>
            <Select
              value={fontFamily}
              onValueChange={(v) => {
                if (!v) return;
                setFontFamily(v);
                onUpdate({ fontFamily: v });
              }}
            >
              <SelectTrigger className="text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
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
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFontSize(v);
                  onUpdate({ fontSize: v });
                }}
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Kolor</Label>
              <input
                type="color"
                value={fill}
                onChange={(e) => {
                  setFill(e.target.value);
                  onUpdate({ fill: e.target.value });
                }}
                className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                const v = !bold;
                setBold(v);
                onUpdate({ bold: v });
              }}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm border transition-colors ${bold ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                const v = !italic;
                setItalic(v);
                onUpdate({ italic: v });
              }}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm border transition-colors ${italic ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
