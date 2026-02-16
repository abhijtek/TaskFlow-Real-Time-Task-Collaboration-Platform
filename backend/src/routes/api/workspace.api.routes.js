import { Router } from "express";
import { requireApiAuth } from "../../middlewares/api-auth.middleware.js";
import {
  addWorkspaceMember,
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace,
  removeWorkspaceMember,
  changeWorkspaceMemberRole,
} from "../../controllers/api/workspace.api.controller.js";

const router = Router();

router.use(requireApiAuth);
router.get("/", listWorkspaces);
router.get("/:id", getWorkspace);
router.post("/", createWorkspace);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);
router.post("/:wsId/members", addWorkspaceMember);
router.delete("/:wsId/members/:userId", removeWorkspaceMember);
router.patch("/:wsId/members/:userId/role", changeWorkspaceMemberRole);

export default router;
