import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV == 'production' ||
    process.env.DATABASE_URL?.includes('sslmode=require')
    ?{rejectUnauthorized: false}
    : false,
})

export async function query<T = any>(text: string, params?: any[]): Promise<T[]>{
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development'){
        console.log('Executed query:', {text: text.trim().slice(0, 60), duration: `${duration}ms`, rows: res.rowCount});
    }
    return res.rows as T[];
}