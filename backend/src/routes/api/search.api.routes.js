import { Router } from "express";
import { requireApiAuth } from "../../middlewares/api-auth.middleware.js";
import { search } from "../../controllers/api/search.api.controller.js";

const router = Router();

router.use(requireApiAuth);
router.get("/", search);

export default router;
