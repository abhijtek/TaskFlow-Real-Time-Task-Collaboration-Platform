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

import api from "@/services/api";
import { authService } from "@/services/auth-service";
import { boardService } from "@/services/board-service";
import { workspaceService } from "@/services/workspace-service";
import { taskService } from "@/services/task-service";
import { searchService } from "@/services/search-service";
import { activityService } from "@/services/activity-service";

describe("API service layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authService uses correct auth endpoints", async () => {
    await authService.login("a@a.com", "secret");
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@a.com",
      password: "secret",
    });

    await authService.signup("A", "a@a.com", "secret");
    expect(api.post).toHaveBeenCalledWith("/auth/signup", {
      name: "A",
      email: "a@a.com",
      password: "secret",
    });

    await authService.me();
    expect(api.get).toHaveBeenCalledWith("/auth/me");
  });

  it("boardService uses correct board endpoints", async () => {
    await boardService.list("ws-1");
    expect(api.get).toHaveBeenCalledWith("/boards", {
      params: { workspace: "ws-1" },
    });

    await boardService.get("b-1");
    expect(api.get).toHaveBeenCalledWith("/boards/b-1");

    await boardService.create({ title: "Sprint" });
    expect(api.post).toHaveBeenCalledWith("/boards", { title: "Sprint" });

    await boardService.update("b-1", { title: "Sprint 2" });
    expect(api.put).toHaveBeenCalledWith("/boards/b-1", { title: "Sprint 2" });

    await boardService.remove("b-1");
    expect(api.delete).toHaveBeenCalledWith("/boards/b-1");
  });

  it("workspaceService uses correct workspace/member endpoints", async () => {
    await workspaceService.list("u-1");
    expect(api.get).toHaveBeenCalledWith("/workspaces");

    await workspaceService.get("w-1");
    expect(api.get).toHaveBeenCalledWith("/workspaces/w-1");

    await workspaceService.create({ name: "Team Space" }, "u-1");
    expect(api.post).toHaveBeenCalledWith("/workspaces", { name: "Team Space" });

    await workspaceService.update("w-1", { name: "Team Space 2" });
    expect(api.put).toHaveBeenCalledWith("/workspaces/w-1", { name: "Team Space 2" });

    await workspaceService.remove("w-1");
    expect(api.delete).toHaveBeenCalledWith("/workspaces/w-1");

    await workspaceService.addMember("w-1", "b@b.com");
    expect(api.post).toHaveBeenCalledWith("/workspaces/w-1/members", {
      email: "b@b.com",
    });

    await workspaceService.removeMember("w-1", "u-2");
    expect(api.delete).toHaveBeenCalledWith("/workspaces/w-1/members/u-2");

    await workspaceService.changeMemberRole("w-1", "u-2", "admin");
    expect(api.patch).toHaveBeenCalledWith("/workspaces/w-1/members/u-2/role", {
      role: "admin",
    });
  });

  it("task/search/activity services use correct endpoints", async () => {
    await taskService.listByBoard("b-1");
    expect(api.get).toHaveBeenCalledWith("/tasks", { params: { board: "b-1" } });

    await taskService.create({ title: "T1", board: "b-1", list: "l-1" });
    expect(api.post).toHaveBeenCalledWith("/tasks", {
      title: "T1",
      board: "b-1",
      list: "l-1",
    });

    await taskService.update("t-1", { title: "T2" });
    expect(api.put).toHaveBeenCalledWith("/tasks/t-1", { title: "T2" });

    await taskService.remove("t-1");
    expect(api.delete).toHaveBeenCalledWith("/tasks/t-1");

    await taskService.move("t-1", "l-2", 3);
    expect(api.patch).toHaveBeenCalledWith("/tasks/t-1/move", {
      listId: "l-2",
      position: 3,
    });

    await taskService.assign("t-1", "u-2");
    expect(api.patch).toHaveBeenCalledWith("/tasks/t-1/assign", {
      assigneeId: "u-2",
    });

    await searchService.search("bug", "w-1");
    expect(api.get).toHaveBeenCalledWith("/search", {
      params: { q: "bug", workspace: "w-1" },
    });

    await activityService.list("b-1", 2, 10);
    expect(api.get).toHaveBeenCalledWith("/activities", {
      params: { boardId: "b-1", page: 2, limit: 10 },
    });
  });
});

