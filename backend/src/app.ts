import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(express.json());
app.use(cors());

//Routes
app.use("/auth", authRoutes);
app.use('/protected', protectedRoutes);

app.get("/", (req, res) => {
    res.send("Backend is working");
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
})