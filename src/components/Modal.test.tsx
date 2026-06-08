import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

// jsdom doesn't implement showModal/close natively
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Hidden</p>
      </Modal>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders children when open", () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Visible</p>
      </Modal>,
    );
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("calls showModal on the dialog element", () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        Content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on backdrop click", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Inner</p>
      </Modal>,
    );
    // Click on the dialog element itself (backdrop), not the inner content
    const dialog = screen.getByText("Inner").closest("dialog")!;
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when clicking inner content", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Inner</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText("Inner"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(
      <Modal open={true} onClose={vi.fn()} className="custom-modal">
        Content
      </Modal>,
    );
    const dialog = screen.getByText("Content").closest("dialog")!;
    expect(dialog.className).toContain("custom-modal");
  });
});
