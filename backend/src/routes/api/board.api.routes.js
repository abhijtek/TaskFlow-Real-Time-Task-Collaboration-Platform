import { Router } from "express";
import { requireApiAuth } from "../../middlewares/api-auth.middleware.js";
import {
  createBoard,
  deleteBoard,
  getBoard,
  listBoards,
  updateBoard,
} from "../../controllers/api/board.api.controller.js";

const router = Router();

router.use(requireApiAuth);
router.get("/", listBoards);
router.get("/:id", getBoard);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

export default router;
