import api from "./api";
import { mockBoards, mockTasks } from "@/lib/mock-store";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const normalizeTaskPayload = (data = {}) => {
  const payload = { ...data };
  if (payload.listId !== undefined) {
    payload.list = payload.listId;
    delete payload.listId;
  }
  return payload;
};

export const taskService = {
  async listByBoard(boardId) {
    if (!boardId) return [];
    if (USE_MOCK) {
      const board = mockBoards.get(boardId);
      return board?.tasks || [];
    }
    return api.get("/tasks", { params: { board: boardId } });
  },

  async create(listIdOrData, dataOrUserId, maybeUserId) {
    const isLegacySignature = typeof listIdOrData === "string" && dataOrUserId && typeof dataOrUserId === "object";
    const payload = normalizeTaskPayload(
      isLegacySignature ? { ...dataOrUserId, list: listIdOrData } : listIdOrData,
    );
    const userId = isLegacySignature ? maybeUserId : dataOrUserId;

    if (USE_MOCK) return mockTasks.create(payload, userId);
    return api.post("/tasks", payload);
  },

  async update(id, data, userId) {
    const payload = normalizeTaskPayload(data);
    if (USE_MOCK) return mockTasks.update(id, payload, userId);
    return api.put(`/tasks/${id}`, payload);
  },

  async remove(id, userId) {
    if (USE_MOCK) return mockTasks.delete(id, userId);
    return api.delete(`/tasks/${id}`);
  },

  async delete(id, userId) {
    return this.remove(id, userId);
  },

  async move(id, listId, position, userId) {
    if (USE_MOCK) return mockTasks.move(id, listId, position, userId);
    return api.patch(`/tasks/${id}/move`, { listId, position });
  },

  async assign(id, assigneeId, userId) {
    if (USE_MOCK) return mockTasks.assign(id, assigneeId, userId);
    return api.patch(`/tasks/${id}/assign`, { assigneeId });
  },
};

