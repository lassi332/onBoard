import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createWorkspace, getMyWorkspaces, getWorkspaceById} from "../controllers/workspace.controller";
import { createProject, getProjectByWorkspace, getProjestById } from "../controllers/project-controller";

const router = Router();

router.post('/', requireAuth, createWorkspace);
router.get('/', requireAuth, getMyWorkspaces);
router.get('/:id', requireAuth, getWorkspaceById);
router.post('/:workspaceId/projects', requireAuth, createProject);
router.get('/:workspaceId/projects', requireAuth, getProjectByWorkspace);

export default router;
