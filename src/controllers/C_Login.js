const { UserLogin, GetAllUsers } = require("../models/M_User");
const handleError = require("./Helpers/ErrorHandler");
const { CreateAndAssignToken } = require("../models/M_Token");

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await UserLogin(email, password);
        const token = await CreateAndAssignToken("user", user);
        res.cookie("curtoken", token, {
            httpOnly: true,
            maxAge: (process.env.TOKEN_AGE || 3 * 24 * 60 * 60) * 1000 //?3 Days
        })
        res.status(201).json({ email: user.email })
    }catch(err){
        const errors = handleError(err);
        res.status(500).json({ errors });
    }
}

const getUsers = async (req, res) => {
    try{
        const users = await GetAllUsers();
        res.status(200).json({
            users
        });
    }catch(err){
        console.log(err);
    }
}

const postLogout = async (req, res) => {
    try{
        res.cookie("curtoken", "", {
            maxAge: 1,
            httpOnly: true
        })
        res.status(200).json({
            success: "User Log Out"
        })
    }catch(err){
        console.log(err);
    }
}

module.exports = { postLogin, getUsers, postLogout }