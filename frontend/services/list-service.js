import api from "./api";
import { mockLists } from "@/lib/mock-store";
import { boardService } from "./board-service";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const normalizeListPayload = (data = {}) => ({
  title: data.title ?? data.name,
  board: data.board ?? data.boardId,
  position: data.position,
});

export const listService = {
  async list(boardId) {
    if (!boardId) return [];
    const board = await boardService.get(boardId);
    return board?.lists || [];
  },

  async create(boardIdOrData, maybeData) {
    const payload = maybeData
      ? normalizeListPayload({ ...maybeData, board: boardIdOrData })
      : normalizeListPayload(boardIdOrData);

    if (USE_MOCK) return mockLists.create(payload);
    return api.post("/lists", payload);
  },

  async update(id, data) {
    const payload = {};
    if (data?.title !== undefined) payload.title = data.title;
    if (data?.name !== undefined) payload.title = data.name;
    if (data?.position !== undefined) payload.position = data.position;

    if (USE_MOCK) return mockLists.update(id, payload);
    return api.put(`/lists/${id}`, payload);
  },

  async remove(id) {
    if (USE_MOCK) return mockLists.delete(id);
    return api.delete(`/lists/${id}`);
  },

  async reorder(boardId, listOrder) {
    if (USE_MOCK) return mockLists.reorder(boardId, listOrder);
    return api.patch("/lists/reorder", { boardId, listOrder });
  },
};

