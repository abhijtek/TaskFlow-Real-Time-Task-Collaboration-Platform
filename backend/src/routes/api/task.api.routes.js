import { Router } from "express";
import { requireApiAuth } from "../../middlewares/api-auth.middleware.js";
import {
  assignTask,
  createTask,
  deleteTask,
  listTasks,
  moveTask,
  updateTask,
} from "../../controllers/api/task.api.controller.js";

const router = Router();

router.use(requireApiAuth);
router.get("/", listTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/move", moveTask);
router.patch("/:id/assign", assignTask);

export default router;
