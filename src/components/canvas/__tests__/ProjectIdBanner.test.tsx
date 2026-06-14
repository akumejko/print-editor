import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ProjectIdBanner } from "../ProjectIdBanner";

describe("ProjectIdBanner", () => {
  it("renders the project ID", () => {
    render(<ProjectIdBanner projectId="AB12CD34" copied={false} onCopy={vi.fn()} />);
    expect(screen.getByText("AB12CD34")).toBeInTheDocument();
  });

  it("shows 'Kopiuj' button when not copied", () => {
    render(<ProjectIdBanner projectId="AB12CD34" copied={false} onCopy={vi.fn()} />);
    expect(screen.getByText(/Kopiuj/)).toBeInTheDocument();
  });

  it("shows 'Skopiowano' when copied=true", () => {
    render(<ProjectIdBanner projectId="AB12CD34" copied={true} onCopy={vi.fn()} />);
    expect(screen.getByText(/Skopiowano/)).toBeInTheDocument();
  });

  it("calls onCopy when button is clicked", async () => {
    const onCopy = vi.fn();
    render(<ProjectIdBanner projectId="AB12CD34" copied={false} onCopy={onCopy} />);
    await userEvent.click(screen.getByText(/Kopiuj/));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
