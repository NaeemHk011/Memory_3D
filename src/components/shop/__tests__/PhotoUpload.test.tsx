import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoUpload } from "../PhotoUpload";

const mockOnPhotoChange = vi.fn();
const SHAPE_IMG = "/shapes/heart.png";

function setup() {
  return render(
    <PhotoUpload
      shapePreviewImage={SHAPE_IMG}
      onPhotoChange={mockOnPhotoChange}
    />
  );
}

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

beforeEach(() => {
  mockOnPhotoChange.mockClear();
  vi.mocked(URL.createObjectURL).mockReturnValue("blob:mock-url");
});

describe("PhotoUpload — file validation", () => {
  it("accepts a valid image under 10 MB", async () => {
    setup();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("photo.jpg", "image/jpeg", 1 * 1024 * 1024);
    await userEvent.upload(input, file);

    await waitFor(() => expect(mockOnPhotoChange).toHaveBeenCalledWith(file));
    expect(screen.queryByText(/too large/i)).not.toBeInTheDocument();
  });

  it("rejects a file larger than 10 MB and shows error", async () => {
    setup();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("big.jpg", "image/jpeg", 11 * 1024 * 1024);
    await userEvent.upload(input, file);

    await waitFor(() => expect(screen.getByText(/too large/i)).toBeInTheDocument());
    expect(mockOnPhotoChange).not.toHaveBeenCalled();
    expect(screen.getByText(/10 MB/i)).toBeInTheDocument();
  });

  it("rejects non-image files and shows error", async () => {
    setup();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("doc.pdf", "application/pdf", 500 * 1024);
    // userEvent.upload respects accept="image/*" and silently drops non-images,
    // so use fireEvent.change to simulate the browser allowing any file through.
    Object.defineProperty(input, "files", { value: [file], writable: false });
    fireEvent.change(input);

    await waitFor(() =>
      expect(screen.getByText(/only image files/i)).toBeInTheDocument()
    );
    expect(mockOnPhotoChange).not.toHaveBeenCalled();
  });

  it("clears error when reset is clicked", async () => {
    setup();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const tooBig = makeFile("big.jpg", "image/jpeg", 11 * 1024 * 1024);
    await userEvent.upload(input, tooBig);
    await waitFor(() => expect(screen.getByText(/too large/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/start over/i));
    await waitFor(() => expect(screen.queryByText(/too large/i)).not.toBeInTheDocument());
  });

  it("accepts drag-and-drop of valid image", async () => {
    setup();
    const dropZone = screen.getByText(/upload your photo/i).closest("div")!.parentElement!;
    const file = makeFile("drop.png", "image/png", 2 * 1024 * 1024);

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => expect(mockOnPhotoChange).toHaveBeenCalledWith(file));
  });
});
