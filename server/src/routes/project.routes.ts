import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getProjestById } from "../controllers/project-controller";

const router = Router();

router.get('/:id', requireAuth, getProjestById);

export default router;