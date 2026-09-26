import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderMitraPanel } from "./ordermitra-panel";

let mockChatState: Record<string, unknown>;
const mockStop = jest.fn();
const mockReload = jest.fn();

jest.mock("ai/react", () => ({
  useChat: () => mockChatState,
}), { virtual: true });

beforeEach(() => {
  jest.clearAllMocks();
  mockChatState = {
    messages: [],
    input: "",
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    status: "ready",
    stop: mockStop,
    reload: mockReload,
    error: undefined,
  };
});

test("shows the panel title, empty-state text, and question form", () => {
  render(<OrderMitraPanel />);

  expect(screen.getByRole("heading", { name: "OrderMitra" })).toBeInTheDocument();
  expect(screen.getByText("Ask about an order to get started.")).toBeInTheDocument();
  expect(screen.getByLabelText("Ask a question")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
});

test("displays the user's question and the assistant's reply", () => {
  mockChatState.messages = [
    { id: "1", role: "user", content: "Find Mr. Iyer's orders" },
    { id: "2", role: "assistant", content: "Found 2 orders for Mr. Iyer." },
  ];

  render(<OrderMitraPanel />);

  expect(screen.getByText("Find Mr. Iyer's orders")).toBeInTheDocument();
  expect(screen.getByText("Found 2 orders for Mr. Iyer.")).toBeInTheDocument();
});

test("stops generating when the stop button is clicked", async () => {
  mockChatState.status = "streaming";
  const user = userEvent.setup();

  render(<OrderMitraPanel />);
  await user.click(screen.getByRole("button", { name: "Stop generating" }));

  expect(mockStop).toHaveBeenCalledTimes(1);
});

test("retries the request when Retry is clicked after an error", async () => {
  mockChatState.error = new Error("model unavailable");
  const user = userEvent.setup();

  render(<OrderMitraPanel />);
  expect(screen.getByRole("alert")).toHaveTextContent("model unavailable");
  await user.click(screen.getByRole("button", { name: "Retry" }));

  expect(mockReload).toHaveBeenCalledTimes(1);
});