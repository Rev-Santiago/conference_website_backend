import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db.js";
import dotenv from "dotenv";
import process from "process";

dotenv.config();

// Function to log in users
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        // Basic input validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Fetch user from the database
        const [users] = await db.execute("SELECT id, email, password FROM admins WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = users[0];

        // Compare passwords securely
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        // Set token in HTTP-only cookie (secure and better than localStorage)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 3600000 // 1 hour
        });

        res.json({ message: "Login successful" });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
