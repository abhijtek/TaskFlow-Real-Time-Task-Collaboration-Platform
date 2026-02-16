// ...existing code...
import api from "./api";
import { mockWorkspaces } from "@/lib/mock-store";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const workspaceService = {
  async list(userId) {
    if (USE_MOCK) return mockWorkspaces.list(userId);
    return api.get("/workspaces");
  },

  async get(id) {
    if (USE_MOCK) return mockWorkspaces.get(id);
    return api.get(`/workspaces/${id}`);
  },

  async create(data, userId) {
    if (USE_MOCK) return mockWorkspaces.create(data, userId);
    return api.post("/workspaces", data);
  },

  async update(id, data) {
    if (USE_MOCK) return mockWorkspaces.update(id, data);
    return api.put(`/workspaces/${id}`, data);
  },

  async remove(id) {
    if (USE_MOCK) return mockWorkspaces.delete(id);
    return api.delete(`/workspaces/${id}`);
  },

  async addMember(wsId, email) {
    if (USE_MOCK) return mockWorkspaces.addMember(wsId, email);
    return api.post(`/workspaces/${wsId}/members`, { email });
  },
  async removeMember(wsId, userId) {
    if (USE_MOCK && mockWorkspaces.removeMember) return mockWorkspaces.removeMember(wsId, userId);
    return api.delete(`/workspaces/${wsId}/members/${userId}`);
  },

  async changeMemberRole(wsId, userId, role) {
    if (USE_MOCK && mockWorkspaces.changeMemberRole) {
      return mockWorkspaces.changeMemberRole(wsId, userId, role);
    }
    return api.patch(`/workspaces/${wsId}/members/${userId}/role`, { role });
  },
};
