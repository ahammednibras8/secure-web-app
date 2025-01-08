import express from "express";
import { verifyToken, requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
    res.status(200).json({ message: "Welcome, Admin!", user: req.user });
});

router.get('/user', verifyToken, requireRole('user'), (req, res) => {
    res.status(200).json({ message: "Welcome, User!", user: req.user });
});

router.get('/public', (req, res) => {
    res.status(200).json({ message: "Welcome, this is a public Route!" });
});

export default router;