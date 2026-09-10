import { Request, Response } from "express";
import { query } from "../db";

export async function createProject(req: Request, res: Response){
    try {

        const { workspaceId } = req.params;
        const { key, name, description } = req.body;
        if(!key || !name ){
            return res.status(400).json({
                error: 'name or key not provided'
            });
        }
        
        const usr = await query('select * from workspace_members where workspace_id = $1 AND user_id = $2', [workspaceId, req.user!.id]);
        
        if(usr.length === 0){
            return res.status(403).json({
                error: 'forbidden access'
            });
        }
        
        const rows = await query('insert into projects (workspace_id, key, name, description) values ($1, $2, $3, $4)returning *', [workspaceId, key, name, description || null]);
        
        return res.status(201).json({
            message: 'project added successfully',
            project: rows[0]
        });
    }catch(e){

        if((e as any).code === '23505'){
            return res.status(400).json({
                error: 'duplicate project exist'
            });    
        }
        return res.status(500).json({
            error: 'failed to add project'
        });
    }
}

export async function getProjectByWorkspace(req: Request, res: Response){
    try{
        const {workspaceId} = req.params;
        const usr = await query('select * from workspace_members where workspace_id = $1 AND user_id = $2', [workspaceId, req.user!.id]);
        
        if(usr.length === 0){
            return res.status(403).json({
                error: 'forbidden access'
            });
        }

        const rows = await query('select * from projects where workspace_id = $1 order by created_at', [workspaceId]);

        return res.status(200).json({
            projests: rows
        })
    }catch(e){
        return res.status(500).json({
            error: 'failed to get projests'
        });
    }
}

export async function getProjestById(req: Request, res: Response){
    try{
        const {id} = req.params;

        const projects = await query('select * from projects p join workspace_members wm on p.workspace_id = wm.workspace_id where p.id = $1 and wm.user_id = $2', [id, req.user!.id]);

        if( projects.length === 0 ){
            return res.status(404).json({
                error: 'not found or forbindden'
            });
        }

        return res.status(200).json({
            projects: projects[0]
        });
    }catch(e){
        res.status(500).json({
            error: 'failed to get projects'
        });
    }
}