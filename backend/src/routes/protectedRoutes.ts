import express from "express";
import { verifyToken, requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
    res.status(200).json({ message: "Welcome, Admin!" });
});

router.get('/user', verifyToken, requireRole('user'), (req, res) => {
    res.status(200).json({ message: "Welcome, User!" });
})

export default router;