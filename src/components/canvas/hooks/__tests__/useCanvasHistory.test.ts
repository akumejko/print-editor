import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCanvasHistory } from "../useCanvasHistory";
import type * as fabric from "fabric";

function makeMockCanvas(json = "{}") {
  return {
    toJSON: vi.fn(() => JSON.parse(json)),
    loadFromJSON: vi.fn().mockResolvedValue(undefined),
    renderAll: vi.fn(),
  } as unknown as fabric.Canvas;
}

describe("useCanvasHistory", () => {
  it("starts with canUndo=false and canRedo=false", () => {
    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(null);
      return useCanvasHistory(fabricRef, vi.fn());
    });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("saveHistory enables canUndo after second save", () => {
    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useCanvasHistory(fabricRef, vi.fn());
    });

    act(() => result.current.saveHistory());
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.saveHistory());
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo enables canRedo and decrements history", async () => {
    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useCanvasHistory(fabricRef, vi.fn());
    });

    act(() => result.current.saveHistory());
    act(() => result.current.saveHistory());
    expect(result.current.canUndo).toBe(true);

    await act(async () => result.current.undo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redo disables canRedo when at latest state", async () => {
    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useCanvasHistory(fabricRef, vi.fn());
    });

    act(() => result.current.saveHistory());
    act(() => result.current.saveHistory());
    await act(async () => result.current.undo());
    await act(async () => result.current.redo());

    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("undo calls onRestore callback", async () => {
    const onRestore = vi.fn();
    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useCanvasHistory(fabricRef, onRestore);
    });

    act(() => result.current.saveHistory());
    act(() => result.current.saveHistory());
    await act(async () => result.current.undo());

    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it("saveHistory is skipped when isRestoring", () => {
    const mockCanvas = makeMockCanvas();
    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(mockCanvas);
      return useCanvasHistory(fabricRef, vi.fn());
    });

    act(() => {
      result.current.isRestoringRef.current = true;
      result.current.saveHistory();
    });

    expect(mockCanvas.toJSON).not.toHaveBeenCalled();
  });
});
