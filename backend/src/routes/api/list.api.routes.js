import { Router } from "express";
import { requireApiAuth } from "../../middlewares/api-auth.middleware.js";
import {
  createList,
  deleteList,
  reorderLists,
  updateList,
} from "../../controllers/api/list.api.controller.js";

const router = Router();

router.use(requireApiAuth);
router.post("/", createList);
router.put("/:id", updateList);
router.delete("/:id", deleteList);
router.patch("/reorder", reorderLists);

export default router;
