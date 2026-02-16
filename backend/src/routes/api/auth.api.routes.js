import { Router } from "express";
import { login, me, signup } from "../../controllers/api/auth.api.controller.js";
import { requireApiAuth } from "../../middlewares/api-auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", requireApiAuth, me);

export default router;
