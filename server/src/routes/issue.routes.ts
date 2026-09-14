import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createIssue, getIssuesByProject, updateIssues, deleteIssue } from "../controllers/issue.controller";

const router = Router({
    mergeParams: true 
});

router.post('/projects/:projectId/issues', requireAuth, createIssue);
router.get('/projects/:projectId/issues', requireAuth, getIssuesByProject);
router.patch('/issues/:id', requireAuth, updateIssues);
router.delete('/issues/:id', requireAuth, deleteIssue);

export default router;