import { useCallback, useRef, useState } from "react";
import type { RefObject, MutableRefObject } from "react";
import type * as fabric from "fabric";

export interface UseCanvasHistoryReturn {
  isRestoringRef: MutableRefObject<boolean>;
  saveHistory: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

export function useCanvasHistory(
  fabricRef: RefObject<fabric.Canvas | null>,
  onRestore: () => void
): UseCanvasHistoryReturn {
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isRestoringRef = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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
  }, [fabricRef]);

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
    onRestore();
  }, [fabricRef, onRestore]);

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
    onRestore();
  }, [fabricRef, onRestore]);

  return { isRestoringRef, saveHistory, undo, redo, canUndo, canRedo };
}
