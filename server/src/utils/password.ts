import bcrypt from 'bcryptjs';

const SALT_ROUND = 10;

export async function hashPassword(password: string) : Promise<string> {
    const hashedPass = await bcrypt.hash(password, SALT_ROUND);
    return hashedPass;
}

export async function comparePassword(password: string, hash: string): Promise<boolean>{
    const res = await bcrypt.compare(password, hash);
    return res;
}

