import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PropertiesPanel } from "../PropertiesPanel";
import type { SelectedObjState } from "../../types";

const IMAGE_OBJ: SelectedObjState = { type: "image", angle: 0, opacity: 100 };
const TEXT_OBJ: SelectedObjState = {
  type: "text",
  angle: 45,
  opacity: 80,
  fontSize: 24,
  fontFamily: "Roboto",
  fill: "#ff0000",
  bold: false,
  italic: true,
};

describe("PropertiesPanel", () => {
  it("renders angle and opacity controls for any object type", () => {
    render(<PropertiesPanel selectedObj={IMAGE_OBJ} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Kąt/)).toBeInTheDocument();
    expect(screen.getByText(/Przezroczystość/)).toBeInTheDocument();
  });

  it("does not render text controls for image objects", () => {
    render(<PropertiesPanel selectedObj={IMAGE_OBJ} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/Czcionka/)).not.toBeInTheDocument();
  });

  it("renders text controls for text objects", () => {
    render(<PropertiesPanel selectedObj={TEXT_OBJ} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Czcionka/)).toBeInTheDocument();
    expect(screen.getByText(/Rozmiar/)).toBeInTheDocument();
    expect(screen.getByText(/Kolor/)).toBeInTheDocument();
  });

  it("calls onDelete when trash button is clicked", async () => {
    const onDelete = vi.fn();
    render(<PropertiesPanel selectedObj={IMAGE_OBJ} onUpdate={onDelete} onDelete={onDelete} />);
    await userEvent.click(screen.getByTitle("Usuń"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("calls onUpdate with new angle value", async () => {
    const onUpdate = vi.fn();
    render(<PropertiesPanel selectedObj={IMAGE_OBJ} onUpdate={onUpdate} onDelete={vi.fn()} />);
    const angleInput = screen.getByDisplayValue("0");
    await userEvent.clear(angleInput);
    await userEvent.type(angleInput, "90");
    expect(onUpdate).toHaveBeenLastCalledWith({ angle: 90 });
  });

  it("syncs form state when selectedObj changes", () => {
    const { rerender } = render(
      <PropertiesPanel selectedObj={IMAGE_OBJ} onUpdate={vi.fn()} onDelete={vi.fn()} />
    );
    rerender(
      <PropertiesPanel selectedObj={{ ...IMAGE_OBJ, angle: 180 }} onUpdate={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByDisplayValue("180")).toBeInTheDocument();
  });
});
