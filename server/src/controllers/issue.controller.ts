import { Request, Response } from "express";
import { query } from "../db";

export async function createIssue(req: Request, res: Response){
    try{

        const { projectId } = req.params;
        const { title, description, status, priority, due_date, assignee_id, order_index } = req.body;
        
        if(!title) {
            return res.status(400).json({
                error: 'Title is required'
            });
        }
        
        const rows = await query('select * from projects p join workspace_members wm on p.workspace_id = wm.workspace_id where p.id = $1 and wm.user_id = $2', [projectId, req.user?.id]);
        
        if(rows.length === 0){
            return res.status(403).json({
                error: 'no data or not permitted'
            });
        }
        
        const issues = await query('insert into issues (project_id, title, description, status, priority, due_date, assignee_id, reporter_id, order_index) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *', [projectId, title, description || null, status || 'TODO', priority || 'MEDIUM', due_date, assignee_id, req.user!.id, order_index || 0]);
        
        return res.status(201).json({
            message: 'issue created',
            issue: issues[0]
        });
    }catch(e){
        return res.status(500).json({
            error: 'failed to create the issue'
        });
    }
}

export async function getIssuesByProject(req: Request, res: Response){
    try{

        const { projectId } = req.params;
        const { status, priority, assignee_id, q} = req.query;
        
        const users = await query('select * from projects p join workspace_members wm on p.workspace_id = wm.workspace_id where wm.user_id = $1 and p.id = $2', [req.user!.id, projectId]);
        
        if(users.length === 0){
            return res.status(403).json({
                error: 'not found or not permitted'
            });
        }
        
        let sql = 'select i.*, ass.name as assignee_name, rep.name as reporter_name from issues i left join users ass on i.assignee_id = ass.id join users rep on rep.id = i.reporter_id where i.project_id = $1';
        
        let params: any[] = [projectId];
        
        let paramIdx = 2;
        
        if(status){
            sql += ` and i.status = $${paramIdx}`;
            paramIdx++;
            params.push(status);
        }
        
        if (priority) {                                    
            sql += ` AND i.priority = $${paramIdx}`;       
            params.push(priority);                           
            paramIdx++;                                    
        } 
        
        if (assignee_id) {
            sql += ` AND i.assignee_id = $${paramIdx}`;    
            params.push(assignee_id);
            paramIdx++;
        }
        
        if(q){
            sql += ` and (i.title ilike $${paramIdx} or i.description ilike $${paramIdx})`;
            params.push(`%${q}%`);
            paramIdx++;
        }
        
        sql += ` ORDER BY i.order_index ASC, i.created_at  DESC`;
        
        const rows = await query(sql, params);
        
        return res.status(200).json({
            issues: rows
        });

    }catch(e){
        return res.status(500).json({
            error: 'failed to get issues'
        });
    }
}

export async function updateIssues(req: Request, res: Response){
    try{

        const { id } = req.params;
        const { title, description, status, priority, assignee_id, order_index, due_date } = req.body;
        
        const rows = await query('update issues set title = coalesce($1, title), description = COALESCE($2, description), status = COALESCE($3, status), priority = COALESCE($4, priority), assignee_id = COALESCE($5, assignee_id), order_index = COALESCE($6, order_index), due_date = COALESCE($7, due_date), updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *', [title, description, status, priority, assignee_id, order_index, due_date, id]);
        
        if(rows.length === 0){
            return res.status(404).json({
                error: 'now row found and updated'
            });
        }
        
        return res.status(200).json({
            message: 'Issue updates successfully',
            issue: rows[0]
        });
    }catch(e){
        return res.status(500).json({
            error: 'failed to update the issue'
        });
    }
}

export async function deleteIssue(req: Request, res: Response){
    try{
        const { id } = req.params;
        
        const rows = await query('delete from issues where id = $1 returning id', [id]);
        
        if(rows.length === 0){
            return res.status(404).json({
                error: 'could not delete'
            });
        }
        
        return res.status(200).json({
            message: 'Issue deleted successfully'
        });
    }catch(e){
        return res.status(500).json({
            error: 'failed to delete issue'
        });
    }
}