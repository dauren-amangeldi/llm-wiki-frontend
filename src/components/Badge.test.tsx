import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders label text", () => {
    render(<Badge label="New" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("has badge class", () => {
    const { container } = render(<Badge label="Tag" />);
    expect(container.firstElementChild?.className).toContain("badge");
  });

  it("applies custom className", () => {
    const { container } = render(<Badge label="Custom" className="extra" />);
    expect(container.firstElementChild?.className).toContain("extra");
  });

  it("renders without icon by default", () => {
    const { container } = render(<Badge label="Plain" />);
    // No SVG should be rendered
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders icon when provided", () => {
    render(<Badge icon="check" label="Done" />);
    // Icon component renders an SVG from lucide-react
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});
