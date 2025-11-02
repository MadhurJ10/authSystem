import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js"
import { hashPassword, comparePassword } from "../utils/hash.js";



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
            password: hashedPassword,
            // role:'admin'
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


export const login = async (req, res) => {
    const { email, password } = req.body
    // console.log(email)
    try {
        const user = await userModel.findOne({
            email
        });

        // console.log(user.password)

        const check = await comparePassword(password, user.password);
        if (!check) {
            return res.json({
                msg: "invalid credentials"
            })
        }
        const token = await jwt.sign({ id: user._id, role: 'user' }, 'madhur')

        const { password: _, ...userData } = user.toObject();

        return res.json({
            msg: "login succesful",
            token: token,
            userData
        })
    } catch (error) {
        console.log(error)
    }
}

export const changePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const { user } = req; // middleware must set req.user = decoded token payload

        // 1️⃣ Validate input
        if (!password || !newPassword) {
            return res.status(400).json({ msg: "Both old and new passwords are required" });
        }

        // 2️⃣ Find user
        const existingUser = await userModel.findById(user.id);
        if (!existingUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        // 3️⃣ Compare old password
        const isMatch = await comparePassword(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Incorrect old password" });
        }

        // 4️⃣ Prevent same password reuse
        const isSamePassword = await comparePassword(newPassword, existingUser.password);
        if (isSamePassword) {
            return res.status(400).json({ msg: "New password cannot be the same as the old password" });
        }

        // 5️⃣ Hash and update new password
        existingUser.password = await hashPassword(newPassword);
        await existingUser.save();

        return res.status(200).json({ msg: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.res.status(404).json({ msg: "User not found" });
        }

        const token = jwt.sign(
            { id: user._id },
            'madhur',
            { expiresIn: '15m' }
        )

        return res.status(200).json({
            msg: "Password reset link generated",
            token
        });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body

    try {
        if (!newPassword) {
            return res.status(400).json({ msg: "New password is required" });
        }

        const decode = jwt.verify(token, 'madhur');

        const user = await userModel.findById(decode.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        return res.status(200).json({ msg: "Password reset successful" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ msg: "Reset link expired" });
        }
        return res.status(500).json({ msg: "Invalid or expired token" });
    }

}

export const getData = async (req, res) => {
    const { user } = req
    res.json({
        msg: 'admin only access granted',
        user
    })
}