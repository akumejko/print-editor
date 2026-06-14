import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSaveProject } from "../useSaveProject";
import type * as fabric from "fabric";
import type { Product } from "@/config/products";

const MOCK_PRODUCT: Product = {
  id: "mug-ceramic",
  name: "Kubek ceramiczny",
  description: "Klasyczny kubek",
  color: "#ffffff",
  printWidthMm: 210,
  printHeightMm: 95,
  exportWidthPx: 2480,
  exportHeightPx: 1122,
  canvasWidth: 720,
  canvasHeight: 326,
  mockupImage: "/products/mug-ceramic.webp",
};

function makeMockCanvas() {
  return {
    toDataURL: vi.fn(() => "data:image/png;base64,abc"),
  } as unknown as fabric.Canvas;
}

describe("useSaveProject", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("alert", vi.fn());
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with saving=false and no projectId", () => {
    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useSaveProject(fabricRef, MOCK_PRODUCT);
    });
    expect(result.current.saving).toBe(false);
    expect(result.current.projectId).toBeNull();
  });

  it("sets projectId on successful save", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "AB12CD34" }),
    } as Response);

    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useSaveProject(fabricRef, MOCK_PRODUCT);
    });

    await act(async () => result.current.handleSave());

    expect(result.current.projectId).toBe("AB12CD34");
    expect(result.current.saving).toBe(false);
  });

  it("calls alert with API error message on 429", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Dzienny limit projektów został osiągnięty. Spróbuj jutro." }),
    } as Response);

    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useSaveProject(fabricRef, MOCK_PRODUCT);
    });

    await act(async () => result.current.handleSave());

    expect(vi.mocked(alert)).toHaveBeenCalledWith(
      "Dzienny limit projektów został osiągnięty. Spróbuj jutro."
    );
    expect(result.current.projectId).toBeNull();
  });

  it("handleCopy writes projectId to clipboard", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "AB12CD34" }),
    } as Response);

    const { result } = renderHook(() => {
      const fabricRef = useRef<fabric.Canvas | null>(makeMockCanvas());
      return useSaveProject(fabricRef, MOCK_PRODUCT);
    });

    await act(async () => result.current.handleSave());
    act(() => result.current.handleCopy());

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("AB12CD34");
    expect(result.current.copied).toBe(true);
  });
});
