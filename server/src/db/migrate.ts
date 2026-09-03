import fs from 'fs';
import path from 'path';
import { pool } from './index';

async function runMigration(){
    console.log("running db migrations");
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, 'utf8');

    try{
        await pool.query(sql);
        console.log("database shema migration successfully!");
    }catch(error){
        console.log("migration failed", error);
    }finally{
        await pool.end();
    }
}

runMigration();