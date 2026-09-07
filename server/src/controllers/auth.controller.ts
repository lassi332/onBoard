import { Request, Response } from "express";
import { query } from "../db";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken, authCookieOptions } from "../utils/jwt";


export async function register(req: Request, res: Response){
    try{
        const { name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                error: 'Name, email, and password are required'
            });
        }

        if(password.length < 6){
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
    
        const users = await query<number>('select id from users where email = $1', [email.toLowerCase()]);
    
        if(users.length){
            return res.status(400).json({ error: 'Email is already registered' })
        }
    
        const passwordHash = await hashPassword(password);
    
        const newUser = await query('insert into users (name, email, password_hash) values ($1, $2, $3) RETURNING id, name, email', [name, email, passwordHash]);
    
        const token = signToken({
            userId: newUser[0].id
        });
    
        res.cookie('token', token, authCookieOptions);
    
        return res.status(201).json({
            message: 'registration successful',
            user: newUser[0]
        })

    }catch(e){
        res.status(500).json({
            error: 'registration failure'
        });
    }
}

export async function login(req: Request, res: Response)
{
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({
                error: 'enter the details'
            })
        }
    
        const user = await query('select id, name, email, password_hash from users where email = $1', [email.toLowerCase()]);
    
        if(user.length === 0){
            return  res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await comparePassword(password, user[0].password_hash);
    
        if(!isMatch){
            return res.status(401).json({     
                error: 'Invalid email or password' 
            })
        }
    
        const token = signToken({
            userId: user[0].id
        });
    
        res.cookie('token', token, authCookieOptions);
    
        return res.status(200).json({
            message: 'Login successful', 
            user: { id: user[0].id, name: user[0].name, email: user[0].email } 
        })
    }catch(e){
        return res.status(500).json({
            error: 'errer verifying email and password'
        })
    }
}

export async function logout(req: Request, res: Response){
    res.clearCookie('token', authCookieOptions);

    return res.status(200).json({
        message: 'logged out successfully'
    })
}

export async function getMe(req: Request, res: Response){
    return res.status(200).json({
        user: req.user
    })
}