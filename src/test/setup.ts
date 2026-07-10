import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom doesn't support URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();
