import api from "./api";
import { mockSearch } from "@/lib/mock-store";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const searchService = {
  async search(query, workspaceId) {
    if (USE_MOCK) return mockSearch.search(query, workspaceId);
    return api.get("/search", { params: { q: query, workspace: workspaceId } });
  },
};

