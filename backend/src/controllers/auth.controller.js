import userModel from "../models/user.model.js"
import { hashPassword } from "../utils/hash.js";



export const register = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            console.log("User already exists");
            return res.status(400).json({
                msg: "User already exists",
            });
        }

        const hashedPassword = await hashPassword(password);
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        })
        return res.json({
            status: 201,
            msg: "User registered successfully",
            data: { id: user._id, name: user.name, email: user.email },
        })
    } catch (error) {
        console.error("Service Error:", error);
        return { status: 500, msg: "Failed to register user" };
    }
}