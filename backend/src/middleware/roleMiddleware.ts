import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

interface CustomRequest extends Request {
    user?: any;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "Access denied. No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET as string) as any;
        (req as any).user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: "Invalid token" });
    }
};

export const requireRole = (requireRole: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;

        if (!user || user.role !== requireRole) {
            res.status(403).json({ message: "Access denied. Insufficient permissions." });
            return;
        }

        next();
    };
};