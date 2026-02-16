import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar.jsx";

const socketHandlers = {};
const socketMock = {
  connected: true,
  on: vi.fn((event, handler) => {
    socketHandlers[event] = handler;
  }),
  off: vi.fn((event) => {
    delete socketHandlers[event];
  }),
};

const workspacesState = {
  workspaces: [{ _id: "ws-1", name: "Workspace A", color: "#1565c0" }],
  currentWorkspace: { members: [] },
  fetchWorkspaces: vi.fn(),
  fetchWorkspace: vi.fn().mockResolvedValue({}),
  addMember: vi.fn(),
  loading: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ workspaceId: "ws-1", boardId: null }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/context/workspace-context", () => ({
  useWorkspaces: () => workspacesState,
}));

vi.mock("@/services/board-service", () => ({
  boardService: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/socket-client.jsx", () => ({
  getSocket: vi.fn(() => socketMock),
  joinWorkspace: vi.fn(),
  leaveWorkspace: vi.fn(),
}));

import { joinWorkspace } from "@/lib/socket-client.jsx";

describe("Sidebar realtime board updates", () => {
  beforeEach(() => {
    Object.keys(socketHandlers).forEach((key) => delete socketHandlers[key]);
    vi.clearAllMocks();
  });

  it("joins workspace and updates boards list on board-created event", async () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    await waitFor(() => expect(joinWorkspace).toHaveBeenCalledWith("ws-1"));
    expect(socketHandlers["board-created"]).toBeTypeOf("function");

    await act(async () => {
      socketHandlers["board-created"]({
        _id: "board-1",
        title: "Realtime Board",
        workspace: "ws-1",
      });
    });

    expect(await screen.findByText("Realtime Board")).toBeInTheDocument();
  });
});
