import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("@/services/board-service", () => ({
  boardService: {
    get: vi.fn(),
  },
}));

import api from "@/services/api";
import { boardService } from "@/services/board-service";
import { listService } from "@/services/list-service";

describe("listService API behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list(boardId) reads lists from boardService.get response", async () => {
    boardService.get.mockResolvedValue({ lists: [{ _id: "l-1" }] });

    const lists = await listService.list("b-1");

    expect(boardService.get).toHaveBeenCalledWith("b-1");
    expect(lists).toEqual([{ _id: "l-1" }]);
  });

  it("create supports both signatures and normalizes payload", async () => {
    await listService.create("b-1", { title: "Todo", position: 0 });
    expect(api.post).toHaveBeenCalledWith("/lists", {
      title: "Todo",
      board: "b-1",
      position: 0,
    });

    await listService.create({ name: "Doing", boardId: "b-2" });
    expect(api.post).toHaveBeenCalledWith("/lists", {
      title: "Doing",
      board: "b-2",
      position: undefined,
    });
  });

  it("update/remove/reorder call expected endpoints", async () => {
    await listService.update("l-1", { name: "Review", position: 2 });
    expect(api.put).toHaveBeenCalledWith("/lists/l-1", {
      title: "Review",
      position: 2,
    });

    await listService.remove("l-1");
    expect(api.delete).toHaveBeenCalledWith("/lists/l-1");

    await listService.reorder("b-1", ["l-1", "l-2"]);
    expect(api.patch).toHaveBeenCalledWith("/lists/reorder", {
      boardId: "b-1",
      listOrder: ["l-1", "l-2"],
    });
  });
});

