import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateBoardDialog from "@/components/boards/create-board-dialog.jsx";
import { DEFAULT_LISTS } from "@/lib/constants";

vi.mock("@/services/board-service", () => ({
  boardService: {
    create: vi.fn(),
  },
}));

vi.mock("@/services/list-service", () => ({
  listService: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/socket-client", () => ({
  emitBoardCreated: vi.fn(),
}));

import { boardService } from "@/services/board-service";
import { listService } from "@/services/list-service";
import { emitBoardCreated } from "@/lib/socket-client";

describe("CreateBoardDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates board, emits realtime event, creates default lists, and closes", async () => {
    const user = userEvent.setup();
    const board = { _id: "board-1", title: "Sprint 1", workspace: "ws-1" };
    boardService.create.mockResolvedValue(board);
    listService.create.mockResolvedValue({});

    const onCreated = vi.fn();
    const onClose = vi.fn();

    render(
      <CreateBoardDialog
        open
        onClose={onClose}
        workspaceId="ws-1"
        onCreated={onCreated}
      />,
    );

    await user.type(screen.getByPlaceholderText("e.g. Sprint 24"), "Sprint 1");
    await user.click(screen.getByRole("button", { name: /create board/i }));

    await waitFor(() => expect(boardService.create).toHaveBeenCalledTimes(1));
    expect(boardService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sprint 1",
        workspace: "ws-1",
      }),
    );

    expect(emitBoardCreated).toHaveBeenCalledWith(board);
    expect(listService.create).toHaveBeenCalledTimes(DEFAULT_LISTS.length);
    expect(onCreated).toHaveBeenCalledWith(board);
    expect(onClose).toHaveBeenCalled();
  });
});
