import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { query } from '../db';
import { AuthUser } from "../types/express";

export async function requireAuth(req: Request, res: Response, next: NextFunction){
    try{
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if(!token) {
            res.status(401).json({
                error: "Unauthorized: No token provided"
            })
            return;
        }

        const verifcationResponse = verifyToken(token);
        if(!verifcationResponse) {
            res.status(401).json({
                error: "Unauthorized: Invalid or expired token"
            })
            return;
        }
        else{
            const users = await query<AuthUser>('select id, email, name from users where id = $1', [verifcationResponse.userId]);

            if(users.length === 0){
                res.status(401).json({
                    error: 'Unauthorized: User not found'
                })
                return;
            }

            req.user = users[0];

            next();
        }
    }catch(e){
        res.status(500).json({
            error: 'Internal server error during authentication'
        })
    }
}