import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: string };
        }
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "Authorization token is required" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (e) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};

export const requireRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (req.user.role !== requiredRole) {
            res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            return;
        }

        next();
    };
};