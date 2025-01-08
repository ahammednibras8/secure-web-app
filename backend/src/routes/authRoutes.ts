import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();
dotenv.config();

//Test Data (TODO: Update with real Database):
const users: { id: number; username: string; password: string; }[] = [];
let userId = 1;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

// User Registration:
router.post('/register', async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    //Username already exist:
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exist" });
    }

    //Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = { id: userId++, username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

//User Login:
router.post('/login', async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Find User
    const user = users.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    //Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    //Generate JWT TOKEN
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "1h",
    });

    res.status(200).json({ message: 'Login successful', token });
});

//restricted Route
router.get('/admin', verifyToken, (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to admin panel!' });
});

export default router;