import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as fabric from "fabric";
import type { Product } from "@/config/products";
import type { SelectedObjState } from "../types";

interface UseFabricCanvasParams {
  product: Product;
  fabricRef: MutableRefObject<fabric.Canvas | null>;
  isRestoringRef: MutableRefObject<boolean>;
  saveHistory: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  onSelectionChange: (state: SelectedObjState | null) => void;
}

export interface AddTextParams {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface UseCanvasReturn {
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  canvasScale: number;
  addText: (params: AddTextParams) => void;
  addPresetAsset: (src: string) => Promise<void>;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteSelected: () => void;
  updateSelected: (props: Partial<{
    fontSize: number; fontFamily: string; fill: string;
    angle: number; bold: boolean; italic: boolean; opacity: number;
  }>) => void;
}

export function useFabricCanvas({
  product,
  fabricRef,
  isRestoringRef,
  saveHistory,
  undo,
  redo,
  onSelectionChange,
}: UseFabricCanvasParams): UseCanvasReturn {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const fabricInitRef = useRef(false);
  const [canvasScale, setCanvasScale] = useState(1);

  // Keep latest callback versions in a ref so the canvas init effect never
  // needs to re-run (and destroy the canvas) when callback identities change.
  const cbRef = useRef({ saveHistory, undo, redo, onSelectionChange });
  useEffect(() => {
    cbRef.current = { saveHistory, undo, redo, onSelectionChange };
  });

  const syncSelection = useCallback((fc: fabric.Canvas) => {
    const obj = fc.getActiveObject();
    if (!obj) {
      cbRef.current.onSelectionChange(null);
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
    cbRef.current.onSelectionChange(state);
  }, []);

  useEffect(() => {
    if (!canvasElRef.current || fabricInitRef.current) return;
    fabricInitRef.current = true;
    const fc = new fabric.Canvas(canvasElRef.current, {
      width: product.canvasWidth,
      height: product.canvasHeight,
      preserveObjectStacking: true,
      selection: true,
    });
    fabricRef.current = fc;

    fc.on("selection:created", () => syncSelection(fc));
    fc.on("selection:updated", () => syncSelection(fc));
    fc.on("selection:cleared", () => cbRef.current.onSelectionChange(null));
    fc.on("object:modified", () => { syncSelection(fc); cbRef.current.saveHistory(); });
    fc.on("object:added", () => cbRef.current.saveHistory());
    fc.on("object:removed", () => cbRef.current.saveHistory());

    cbRef.current.saveHistory();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        cbRef.current.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        cbRef.current.redo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !inInput) {
        const active = fc.getActiveObject();
        if (active) {
          fc.remove(active);
          fc.discardActiveObject();
          fc.renderAll();
          cbRef.current.onSelectionChange(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      fabricInitRef.current = false;
      fc.dispose();
    };
  }, [product, fabricRef, syncSelection]);

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

  const addText = useCallback(({ text, fontSize, fontFamily, color, bold, italic }: AddTextParams) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const t = new fabric.IText(text || "Twój tekst", {
      left: product.canvasWidth / 2,
      top: product.canvasHeight / 2,
      originX: "center",
      originY: "center",
      fontSize,
      fontFamily,
      fill: color,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
    });
    fc.add(t);
    fc.setActiveObject(t);
    fc.renderAll();
  }, [fabricRef, product]);

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
  }, [fabricRef, product]);

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
  }, [fabricRef, product]);

  const deleteSelected = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) {
      fc.remove(obj);
      fc.discardActiveObject();
      fc.renderAll();
      onSelectionChange(null);
    }
  }, [fabricRef, onSelectionChange]);

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
    [fabricRef, syncSelection]
  );

  return {
    canvasElRef,
    canvasWrapperRef,
    canvasScale,
    addText,
    addPresetAsset,
    handleUpload,
    deleteSelected,
    updateSelected,
  };
}
