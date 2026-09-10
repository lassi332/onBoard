import { Request, Response } from "express";
import { query, pool } from "../db";

export async function createWorkspace(req: Request, res: Response){
    const { name, slug, description } = req.body;

    if(!name || !slug ){
        return res.status(400).json({
            error: 'name and slug are required'
        })
    }

    const client = await pool.connect();
    try{
        await client.query('begin');
        const wsResult = await client.query('insert into workspaces (name, slug, description) values ($1, $2, $3) returning id, name, slug, description, created_at', [name, slug, description]);

        const workspace = wsResult.rows[0];

        await client.query('insert into workspace_members (workspace_id, user_id, role) values($1, $2, $3)', [workspace.id, req.user!.id, 'ADMIN']);

        await client.query('commit');

        return res.status(201).json({
            message: 'Workspace created successfully', workspace
        })
    }
    catch(e){
        await client.query('rollback');
        if((e as any).code === '23505'){
            return res.status(400).json({
                error: 'workspace slug already exist'
            });
        }
        return res.status(500).json({
            error: 'failed to create workspace'
        });
    }finally{
        client.release();
    }
}

export async function getMyWorkspaces(req: Request,res: Response){
    try{
        const rows = await query('SELECT w.id, w.name, w.slug, w.description, wm.role, wm.joined_at FROM workspaces w JOIN workspace_members wm ON w.id = wm.workspace_id WHERE wm.user_id = $1 ORDER BY wm.joined_at DESC', [req.user!.id]);

        return res.status(200).json({
            workspace: rows
        })
    }catch(e){
        return res.status(500).json({
            error: 'failed to get workspace'
        })
    }
}

export async function getWorkspaceById(req: Request, res: Response){
    try{
        const { id } = req.params;

        const ws = await query('SELECT w.id, w.name, w.slug, w.description, wm.role FROM workspaces w JOIN workspace_members wm ON w.id = wm.workspace_id   WHERE w.id = $1 AND wm.user_id = $2', [id, req.user!.id]);

        if(ws.length === 0){
            return res.status(404).json({
                error: 'not found or access denied'
            });
        }

        return res.status(200).json({
            workspace: ws[0]
        });
    }
    catch(e){
        return res.status(500).json({
            error: 'failed to get workspace'
        });
    }
}