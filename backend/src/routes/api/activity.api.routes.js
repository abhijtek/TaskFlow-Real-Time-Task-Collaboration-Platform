import { Router } from "express";
import { requireApiAuth } from "../../middlewares/api-auth.middleware.js";
import { listActivities } from "../../controllers/api/activity.api.controller.js";

const router = Router();

router.use(requireApiAuth);
router.get("/", listActivities);

export default router;
