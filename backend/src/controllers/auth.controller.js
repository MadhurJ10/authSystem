import jwt from "jsonwebtoken";
import Joi from "joi";
import userModel from "../models/user.model.js";
import blacklistTokenModel from "../models/blacklistedToken.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { generateToken } from "../utils/token.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid("user", "admin").default("user"),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
    password: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(6).required(),
});

//register endpoint
export const register = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[ 0 ].message);

    const { name, email, password, role } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 400, "User already exists");
        }

        const hashedPassword = await hashPassword(password);
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = await generateToken({ id: user._id, role: user.role }, "1h");

        return successResponse(res, 201, "User registered successfully", {
            id: user._id,
            name: user.name,
            email: user.email,
            token
        });
    } catch (error) {
        console.error("Register Error:", error);
        return errorResponse(res, 500, "Failed to register user");
    }
};

//login endpoint
export const login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[ 0 ].message);

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return errorResponse(res, 401, "Invalid credentials");
        }

        const token = generateToken({ id: user._id, role: user.role }, "1h");
        const { password: _, ...userData } = user.toObject();

        return successResponse(res, 200, "Login successful", { token, userData });
    } catch (error) {
        console.error("Login Error:", error);
        return errorResponse(res, 500, "Login failed");
    }
};

//CHANGE PASSWORD ENDPOINT
export const changePassword = async (req, res) => {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[ 0 ].message);

    try {
        const { password, newPassword } = req.body;
        const { user } = req; // comes from auth middleware

        const existingUser = await userModel.findById(user.id);
        if (!existingUser) {
            return errorResponse(res, 404, "User not found");
        }

        const isMatch = await comparePassword(password, existingUser.password);
        if (!isMatch) {
            return errorResponse(res, 400, "Incorrect old password");
        }

        const isSamePassword = await comparePassword(
            newPassword,
            existingUser.password
        );
        if (isSamePassword) {
            return errorResponse(res, 400, "New password cannot be the same as old password");
        }

        existingUser.password = await hashPassword(newPassword);
        await existingUser.save();

        return successResponse(res, 200, "Password changed successfully");
    } catch (error) {
        console.error("Change Password Error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
};

// FORGOT PASSWORD ENDPOINT
export const forgotPassword = async (req, res) => {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[ 0 ].message);

    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        const token = generateToken({ id: user._id }, "15m");
        return successResponse(res, 200, "Password reset link generated", { token });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return errorResponse(res, 500, "Internal server error");
    }
};

//RESET PASSWORD ENDPOINT
// NOTE: In a real-world app, this token would be emailed to the user.
// For this assignment/demo, we are just returning the token in the response.
export const resetPassword = async (req, res) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[ 0 ].message);

    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        if (!newPassword) {
            return errorResponse(res, 400, "New password is required");
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        return successResponse(res, 200, "Password reset successful");
    } catch (error) {
        console.error("Reset Password Error:", error);
        if (error.name === "TokenExpiredError") {
            return errorResponse(res, 400, "Reset link expired");
        }
        return errorResponse(res, 400, "Invalid or expired token");
    }
};

// GET DATA ENDPOINT
export const getData = async (req, res) => {
    return successResponse(res, 200, "Admin-only access granted", req.user);
};

//LOGOUT ENDPOINT
export const logout = async (req, res) => {
    try {
        const token = req.token;
        if (!token) return errorResponse(res, 400, "No token provided");

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp)
            return errorResponse(res, 400, "Invalid token format");

        const expiresAt = new Date(decoded.exp * 1000);
        await blacklistTokenModel.create({ token, expiresAt });

        return successResponse(
            res,
            200,
            `${req.user?.name || "User"} logged out successfully`
        );
    } catch (error) {
        console.error("Logout Error:", error);
        return errorResponse(res, 500, "Logout failed. Please try again later.");
    }
};
