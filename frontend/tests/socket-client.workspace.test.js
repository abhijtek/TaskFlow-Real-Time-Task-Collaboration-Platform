import { describe, it, expect, vi, beforeEach } from "vitest";

const emit = vi.fn();
const on = vi.fn();
const connect = vi.fn();
const disconnect = vi.fn();

let socketInstance = {
  connected: true,
  emit,
  on,
  connect,
  disconnect,
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => socketInstance),
}));

describe("socket-client workspace helpers", async () => {
  beforeEach(() => {
    emit.mockClear();
    on.mockClear();
    connect.mockClear();
    disconnect.mockClear();
    socketInstance = { connected: true, emit, on, connect, disconnect };
    localStorage.clear();
  });

  it("emits workspace join/leave and board-created when connected", async () => {
    const mod = await import("@/lib/socket-client.jsx");
    mod.joinWorkspace("ws-1");
    mod.leaveWorkspace("ws-1");
    mod.emitBoardCreated({ _id: "b-1", workspace: "ws-1" });

    expect(emit).toHaveBeenCalledWith("join-workspace", { workspaceId: "ws-1" });
    expect(emit).toHaveBeenCalledWith("leave-workspace", { workspaceId: "ws-1" });
    expect(emit).toHaveBeenCalledWith("board-created", { _id: "b-1", workspace: "ws-1" });
  });
});
