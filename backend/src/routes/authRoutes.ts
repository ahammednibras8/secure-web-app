import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import prisma from "../config/db";

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

// User Registration:
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: "Username and password are required" });
        return;
    }

    //Check Existing User
    const existingUser = await prisma.user.findUnique({
        where: { username },
    });
    if (existingUser) {
        res.status(409).json({ message: "Username already exists" });
        return;
    }

    // Role Check
    if (!role || !["user", "admin"].includes(role)) {
        res.status(400).json({ message: "Invalid role. Allowed roles: user, admin." });
        return;

    }

    //Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { username, password: hashedPassword, role },
        });
        res.status(201).json({ message: "User registration successfully", user });
    } catch (e) {
        res.status(500).json({ error: "Database error" });
    }
});

//User Login:
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: "Username and password are required" });
        return;
    }

    // Find User
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    //Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    //Generate JWT TOKEN
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
    });

    res.status(200).json({ message: 'Login successful', token });
});

export default router;