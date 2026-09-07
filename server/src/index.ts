import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouters from './routes/auth.routes'

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(
    cors({
        origin: process.env.CLIENT_URL ||  'http://localhost:5173',
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouters);

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        message: "app ruuning smoothly",
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () =>{
    console.log(`server running on http://localhost:${port}`);
});



