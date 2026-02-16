import api from "./api";
import { mockActivities } from "@/lib/mock-store";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const activityService = {
  async list(boardId, page = 1, limit = 20) {
    if (USE_MOCK) return mockActivities.list(boardId, page, limit);
    return api.get("/activities", { params: { boardId, page, limit } });
  },
  async getTaskActivities(boardId, taskId, page = 1, limit = 20) {
    const response = await this.list(boardId, page, limit);
    const activities = response.activities || [];
    return activities.filter(a => a.entity === "task" && a.entityId === taskId);
  },
};

