import { useCallback, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type * as fabric from "fabric";
import type { Product } from "@/config/products";

export interface UseSaveProjectReturn {
  saving: boolean;
  projectId: string | null;
  copied: boolean;
  handleSave: () => Promise<void>;
  handleCopy: () => void;
}

export function useSaveProject(
  fabricRef: MutableRefObject<fabric.Canvas | null>,
  product: Product
): UseSaveProjectReturn {
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = useCallback(async () => {
    const fc = fabricRef.current;
    if (!fc) return;
    setSaving(true);
    try {
      const scaleFactor = product.exportWidthPx / product.canvasWidth;
      const dataUrl = fc.toDataURL({ format: "png", multiplier: scaleFactor, quality: 1 });
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
  }, [fabricRef, product]);

  const handleCopy = useCallback(() => {
    if (!projectId) return;
    navigator.clipboard.writeText(projectId);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [projectId]);

  return { saving, projectId, copied, handleSave, handleCopy };
}
