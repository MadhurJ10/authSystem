import  jwt  from "jsonwebtoken";
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


export const login = async (req, res) => {
    const { email, password } = req.body
    // console.log(email)
    try {
        const user = await userModel.findOne({
            email
        })

        console.log(user.password)

        const check = await comparePassword(password, user.password);
        console.log(check);
        if (!check) {
            return res.json({
                msg: "invalid credentials"
            })
        }
        const token = await jwt.sign({id:user._id} , 'madhur')

        return res.json({
            msg:"login succesful",
            token:token,
            user
        })
    } catch (error) {
        console.log(error)
    }
}