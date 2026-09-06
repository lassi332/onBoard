import jwt, { JwtPayload } from 'jsonwebtoken';
import { CookieOptions } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "DefaultSecret";

export interface TokenPayload {
    userId : string
};

export function signToken(payload: TokenPayload): string{
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d'
    });
    return token;
}

export function verifyToken(token: string) : TokenPayload | null{
    try {
        const ret = jwt.verify(token, JWT_SECRET);
        if(typeof ret === 'string'){
            return {
                userId: ret
            };
        }else if(ret.userId){
            return {
                userId: ret.userId
            };
        }else{
            return null;
        }
        
    }catch(error){
        return null;
    }
}

export const authCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

