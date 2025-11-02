import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[ 1 ];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    try {
        const decoded = jwt.verify(token, 'madhur');
        console.log("mid check")
        console.log(decoded)
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ msg: "Invalid token" });
    }
};
