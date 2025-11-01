import userModel from "../models/user.model.js"


export const register = async (req, res) => {
    const { email, password } = req.body
    const check = await userModel.find({
        email: email
    })

    if (check) {
        console.log('user a;ready exists')
        return res.json({
            msg: 'user already existassassss'
        })
    }
    try {
        const user = await userModel.create({
            name: 'madhur',
            email: email,
            password: password
        })
        res.json({
            msg: 'working',
            user
        })
    } catch (error) {
        console.log("errorrr")
    }
}