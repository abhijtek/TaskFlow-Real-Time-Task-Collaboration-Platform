import api from "./api";
import { mockBoards } from "@/lib/mock-store";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const boardService = {
  async list(workspaceId) {
    if (USE_MOCK) return mockBoards.list(workspaceId);
    return api.get("/boards", { params: { workspace: workspaceId } });
  },

  async get(id) {
    if (USE_MOCK) return mockBoards.get(id);
    return api.get(`/boards/${id}`);
  },

  async create(data) {
    if (USE_MOCK) return mockBoards.create(data);
    return api.post("/boards", data);
  },

  async update(id, data) {
    if (USE_MOCK) return mockBoards.update(id, data);
    return api.put(`/boards/${id}`, data);
  },

  async remove(id) {
    if (USE_MOCK) return mockBoards.delete(id);
    return api.delete(`/boards/${id}`);
  },
};

