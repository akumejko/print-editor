"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import type { Product } from "@/config/products";
import { PRESET_ASSETS, FONTS } from "@/config/assets";
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
import {
  Type,
  Image as ImageIcon,
  Trash2,
  Save,
  Upload,
  Bold,
  Italic,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  Copy,
  Undo2,
  Redo2,
} from "lucide-react";

interface Props {
  product: Product;
}

type ToolSection = "text" | "assets" | "upload" | null;

interface SelectedObjState {
  type: "text" | "image" | "other";
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  angle?: number;
  bold?: boolean;
  italic?: boolean;
  opacity?: number;
}

export function CanvasEditor({ product }: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const fabricInitRef = useRef(false);

  // History for undo/redo
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isRestoringRef = useRef(false);

  const [activeSection, setActiveSection] = useState<ToolSection>("text");
  const [textInput, setTextInput] = useState("Twój tekst");
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [textColor, setTextColor] = useState("#000000");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const [selectedObj, setSelectedObj] = useState<SelectedObjState | null>(null);
  const [editFontSize, setEditFontSize] = useState(36);
  const [editFontFamily, setEditFontFamily] = useState("Inter");
  const [editFill, setEditFill] = useState("#000000");
  const [editAngle, setEditAngle] = useState(0);
  const [editBold, setEditBold] = useState(false);
  const [editItalic, setEditItalic] = useState(false);
  const [editOpacity, setEditOpacity] = useState(100);

  const [canvasScale, setCanvasScale] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const syncSelection = useCallback((fc: fabric.Canvas) => {
    const obj = fc.getActiveObject();
    if (!obj) {
      setSelectedObj(null);
      return;
    }
    const isText = obj instanceof fabric.IText || obj instanceof fabric.Textbox;
    const state: SelectedObjState = {
      type: isText ? "text" : obj instanceof fabric.FabricImage ? "image" : "other",
      angle: Math.round(obj.angle ?? 0),
      opacity: Math.round((obj.opacity ?? 1) * 100),
    };
    if (isText) {
      const t = obj as fabric.IText;
      state.fontSize = t.fontSize as number;
      state.fontFamily = t.fontFamily as string;
      state.fill = t.fill as string;
      state.bold = t.fontWeight === "bold";
      state.italic = t.fontStyle === "italic";
    }
    setSelectedObj(state);
    setEditFontSize(state.fontSize ?? 36);
    setEditFontFamily(state.fontFamily ?? "Inter");
    setEditFill(state.fill ?? "#000000");
    setEditAngle(state.angle ?? 0);
    setEditBold(state.bold ?? false);
    setEditItalic(state.italic ?? false);
    setEditOpacity(state.opacity ?? 100);
  }, []);

  const saveHistory = useCallback(() => {
    if (isRestoringRef.current) return;
    const fc = fabricRef.current;
    if (!fc) return;
    const json = JSON.stringify(fc.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(async () => {
    const fc = fabricRef.current;
    if (!fc || historyIndexRef.current <= 0) return;
    isRestoringRef.current = true;
    historyIndexRef.current -= 1;
    const json = JSON.parse(historyRef.current[historyIndexRef.current]);
    await fc.loadFromJSON(json);
    fc.renderAll();
    isRestoringRef.current = false;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
    setSelectedObj(null);
  }, []);

  const redo = useCallback(async () => {
    const fc = fabricRef.current;
    if (!fc || historyIndexRef.current >= historyRef.current.length - 1) return;
    isRestoringRef.current = true;
    historyIndexRef.current += 1;
    const json = JSON.parse(historyRef.current[historyIndexRef.current]);
    await fc.loadFromJSON(json);
    fc.renderAll();
    isRestoringRef.current = false;
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    setSelectedObj(null);
  }, []);

  useEffect(() => {
    if (!canvasElRef.current || fabricInitRef.current) return;
    fabricInitRef.current = true;
    const fc = new fabric.Canvas(canvasElRef.current, {
      width: product.canvasWidth,
      height: product.canvasHeight,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });
    fabricRef.current = fc;

    fc.on("selection:created", () => syncSelection(fc));
    fc.on("selection:updated", () => syncSelection(fc));
    fc.on("selection:cleared", () => setSelectedObj(null));
    fc.on("object:modified", () => { syncSelection(fc); saveHistory(); });
    fc.on("object:added", () => saveHistory());
    fc.on("object:removed", () => saveHistory());

    // Save initial empty canvas state
    saveHistory();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && !inInput) {
        const active = fc.getActiveObject();
        if (active) {
          fc.remove(active);
          fc.discardActiveObject();
          fc.renderAll();
          setSelectedObj(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      fabricInitRef.current = false;
      fc.dispose();
    };
  }, [product, syncSelection, saveHistory, undo, redo]);

  // Responsive canvas: scale down on narrow viewports
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver((entries) => {
      const containerWidth = entries[0].contentRect.width;
      const scale = Math.min(1, containerWidth / product.canvasWidth);
      setCanvasScale(scale);
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [product.canvasWidth]);

  const addText = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const t = new fabric.IText(textInput || "Twój tekst", {
      left: product.canvasWidth / 2,
      top: product.canvasHeight / 2,
      originX: "center",
      originY: "center",
      fontSize,
      fontFamily,
      fill: textColor,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
    });
    fc.add(t);
    fc.setActiveObject(t);
    fc.renderAll();
  }, [textInput, fontSize, fontFamily, textColor, bold, italic, product]);

  const addPresetAsset = useCallback(async (src: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const img = await fabric.FabricImage.fromURL(src, { crossOrigin: "anonymous" });
    img.set({
      left: product.canvasWidth / 2,
      top: product.canvasHeight / 2,
      originX: "center",
      originY: "center",
      scaleX: 80 / (img.width ?? 80),
      scaleY: 80 / (img.height ?? 80),
    });
    fc.add(img);
    fc.setActiveObject(img);
    fc.renderAll();
  }, [product]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fc = fabricRef.current;
      if (!fc || !ev.target?.result) return;
      const img = await fabric.FabricImage.fromURL(ev.target.result as string);
      const maxW = product.canvasWidth * 0.5;
      const maxH = product.canvasHeight * 0.5;
      const scale = Math.min(maxW / (img.width ?? 1), maxH / (img.height ?? 1), 1);
      img.set({
        left: product.canvasWidth / 2,
        top: product.canvasHeight / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
      });
      fc.add(img);
      fc.setActiveObject(img);
      fc.renderAll();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [product]);

  const deleteSelected = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) {
      fc.remove(obj);
      fc.discardActiveObject();
      fc.renderAll();
      setSelectedObj(null);
    }
  }, []);

  const updateSelected = useCallback(
    (props: Partial<{ fontSize: number; fontFamily: string; fill: string; angle: number; bold: boolean; italic: boolean; opacity: number }>) => {
      const fc = fabricRef.current;
      if (!fc) return;
      const obj = fc.getActiveObject();
      if (!obj) return;

      if (props.angle !== undefined) obj.set({ angle: props.angle });
      if (props.opacity !== undefined) obj.set({ opacity: props.opacity / 100 });

      const isText = obj instanceof fabric.IText || obj instanceof fabric.Textbox;
      if (isText) {
        const t = obj as fabric.IText;
        if (props.fontSize !== undefined) t.set({ fontSize: props.fontSize });
        if (props.fontFamily !== undefined) t.set({ fontFamily: props.fontFamily });
        if (props.fill !== undefined) t.set({ fill: props.fill });
        if (props.bold !== undefined) t.set({ fontWeight: props.bold ? "bold" : "normal" });
        if (props.italic !== undefined) t.set({ fontStyle: props.italic ? "italic" : "normal" });
      }
      fc.renderAll();
      syncSelection(fc);
    },
    [syncSelection]
  );

  const handleSave = useCallback(async () => {
    const fc = fabricRef.current;
    if (!fc) return;
    setSaving(true);
    try {
      const scaleFactor = product.exportWidthPx / product.canvasWidth;
      const dataUrl = fc.toDataURL({
        format: "png",
        multiplier: scaleFactor,
        quality: 1,
      });
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Błąd zapisu");
      setProjectId(data.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać projektu. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  }, [product]);

  const handleCopy = useCallback(() => {
    if (!projectId) return;
    navigator.clipboard.writeText(projectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [projectId]);

  const toggleSection = (section: ToolSection) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Left panel: tools */}
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        {/* Text tool */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("text")}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <Type className="w-4 h-4" /> Tekst
            </span>
            {activeSection === "text" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {activeSection === "text" && (
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
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
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
              <Button onClick={addText} className="w-full h-8 text-sm">
                <Type className="w-3.5 h-3.5 mr-1.5" /> Dodaj tekst
              </Button>
            </div>
          )}
        </div>

        {/* Preset assets */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("assets")}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Kształty i grafiki
            </span>
            {activeSection === "assets" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {activeSection === "assets" && (
            <div className="px-3 pb-3 border-t border-slate-100">
              <div className="grid grid-cols-4 gap-1.5 pt-3">
                {PRESET_ASSETS.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => addPresetAsset(asset.src)}
                    title={asset.label}
                    className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center p-1.5 transition-colors border border-slate-200 hover:border-slate-300"
                  >
                    <img src={asset.src} alt={asset.label} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload image */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("upload")}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Własna grafika
            </span>
            {activeSection === "upload" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {activeSection === "upload" && (
            <div className="px-4 pb-4 pt-3 border-t border-slate-100">
              <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-500 text-center">Kliknij, aby wybrać plik<br />(PNG, JPG, SVG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Center: canvas */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              Strefa nadruku — {product.printWidthMm}×{product.printHeightMm} mm
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Cofnij (Ctrl+Z)"
                className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Ponów (Ctrl+Y)"
                className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-8 text-sm"
              >
                {saving ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Zapisuję…</>
                ) : (
                  <><Save className="w-3.5 h-3.5 mr-1.5" /> Zapisz projekt</>
                )}
              </Button>
            </div>
          </div>
          {/* Responsive canvas wrapper: measures available width, scales canvas down on mobile */}
          <div ref={canvasWrapperRef} className="w-full">
            <div
              className="border border-slate-200 rounded-lg overflow-hidden origin-top-left"
              style={{
                width: product.canvasWidth,
                height: product.canvasHeight,
                transform: `scale(${canvasScale})`,
                transformOrigin: "top left",
                marginBottom: canvasScale < 1
                  ? `${product.canvasHeight * (canvasScale - 1)}px`
                  : undefined,
              }}
            >
              <canvas ref={canvasElRef} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Kliknij element, aby go zaznaczyć · narożniki = skala · górny uchwyt = obrót · Del = usuń
          </p>
        </div>

        {/* Project ID banner */}
        {projectId && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-green-800">Projekt zapisany!</p>
              <p className="text-xs text-green-600 mt-0.5">
                Twój kod projektu: <span className="font-mono font-bold text-lg text-green-900">{projectId}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">Zanotuj ten kod — będzie potrzebny do odbioru wydruku.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 border-green-300 text-green-700 hover:bg-green-100"
            >
              {copied ? <><Check className="w-3.5 h-3.5 mr-1" /> Skopiowano</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Kopiuj</>}
            </Button>
          </div>
        )}
      </div>

      {/* Right panel: selected object properties */}
      {selectedObj && (
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Właściwości</span>
              <button
                onClick={deleteSelected}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Usuń"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Angle */}
            <div>
              <Label className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" /> Kąt (°)
              </Label>
              <Input
                type="number"
                min={-360}
                max={360}
                value={editAngle}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setEditAngle(v);
                  updateSelected({ angle: v });
                }}
                className="text-sm h-8"
              />
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Przezroczystość (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={editOpacity}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setEditOpacity(v);
                  updateSelected({ opacity: v });
                }}
                className="text-sm h-8"
              />
            </div>

            {/* Text-specific */}
            {selectedObj.type === "text" && (
              <>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Czcionka</Label>
                  <Select
                    value={editFontFamily}
                    onValueChange={(v) => {
                      if (!v) return;
                      setEditFontFamily(v);
                      updateSelected({ fontFamily: v });
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
                      value={editFontSize}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setEditFontSize(v);
                        updateSelected({ fontSize: v });
                      }}
                      className="text-sm h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">Kolor</Label>
                    <input
                      type="color"
                      value={editFill}
                      onChange={(e) => {
                        setEditFill(e.target.value);
                        updateSelected({ fill: e.target.value });
                      }}
                      className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      const v = !editBold;
                      setEditBold(v);
                      updateSelected({ bold: v });
                    }}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm border transition-colors ${editBold ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const v = !editItalic;
                      setEditItalic(v);
                      updateSelected({ italic: v });
                    }}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm border transition-colors ${editItalic ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
