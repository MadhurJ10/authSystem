import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET;


export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[ 1 ];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ msg: "User no longer exists" });
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ msg: "Invalid token" });
    }
};

export const adminOnly = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Access denied: Admins only" });
    }
    next();
}