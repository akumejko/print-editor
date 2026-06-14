"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Type, Upload, ChevronDown, ChevronRight } from "lucide-react";
import type * as fabric from "fabric";
import type { Product } from "@/config/products";
import type { SelectedObjState, ToolSection } from "./types";
import { useCanvasHistory } from "./hooks/useCanvasHistory";
import { useFabricCanvas } from "./hooks/useFabricCanvas";
import { useSaveProject } from "./hooks/useSaveProject";
import { TextToolPanel } from "./panels/TextToolPanel";
import { AssetsPanel } from "./panels/AssetsPanel";
import { UploadPanel } from "./panels/UploadPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { CanvasToolbar } from "./CanvasToolbar";
import { ProjectIdBanner } from "./ProjectIdBanner";

interface Props {
  product: Product;
}

export function CanvasEditor({ product }: Props) {
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [selectedObj, setSelectedObj] = useState<SelectedObjState | null>(null);
  const [activeSection, setActiveSection] = useState<ToolSection>("text");

  const { isRestoringRef, saveHistory, undo, redo, canUndo, canRedo } = useCanvasHistory(
    fabricRef,
    () => setSelectedObj(null)
  );

  const { canvasElRef, canvasWrapperRef, canvasScale, addText, addPresetAsset, handleUpload, deleteSelected, updateSelected } =
    useFabricCanvas({ product, fabricRef, isRestoringRef, saveHistory, undo, redo, onSelectionChange: setSelectedObj });

  const { saving, projectId, copied, handleSave, handleCopy } = useSaveProject(fabricRef, product);

  const toggleSection = (section: ToolSection) =>
    setActiveSection((prev) => (prev === section ? null : section));

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Left panel: tools */}
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("text")}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2"><Type className="w-4 h-4" /> Tekst</span>
            {activeSection === "text" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {activeSection === "text" && <TextToolPanel onAdd={addText} />}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("assets")}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Kształty i grafiki</span>
            {activeSection === "assets" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {activeSection === "assets" && <AssetsPanel onAdd={addPresetAsset} />}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("upload")}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Własna grafika</span>
            {activeSection === "upload" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {activeSection === "upload" && <UploadPanel onUpload={handleUpload} />}
        </div>
      </div>

      {/* Center: canvas */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <CanvasToolbar
            product={product}
            canUndo={canUndo}
            canRedo={canRedo}
            saving={saving}
            onUndo={undo}
            onRedo={redo}
            onSave={handleSave}
          />
          <div ref={canvasWrapperRef} className="w-full">
            <div
              className="border border-slate-200 rounded-lg overflow-hidden origin-top-left bg-white"
              style={{
                width: product.canvasWidth,
                height: product.canvasHeight,
                transform: `scale(${canvasScale})`,
                transformOrigin: "top left",
                marginBottom: canvasScale < 1 ? `${product.canvasHeight * (canvasScale - 1)}px` : undefined,
              }}
            >
              <canvas ref={canvasElRef} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Kliknij element, aby go zaznaczyć · narożniki = skala · górny uchwyt = obrót · Del = usuń
          </p>
        </div>
        {projectId && <ProjectIdBanner projectId={projectId} copied={copied} onCopy={handleCopy} />}
      </div>

      {/* Right panel: selected object properties */}
      {selectedObj && (
        <div className="w-full lg:w-56 shrink-0">
          <PropertiesPanel
            selectedObj={selectedObj}
            onUpdate={updateSelected}
            onDelete={deleteSelected}
          />
        </div>
      )}
    </div>
  );
}
