const jwt = require("jsonwebtoken");
const { UserLogin, GetAllUsers } = require("../models/M_User");
const handleError = require("./Helpers/ErrorHandler");

const createToken = (email) => {
    return jwt.sign({ email }, process.env.SECRET_CODE, {
        expiresIn: process.env.TOKEN_AGE || 3 * 24 * 60 * 60
    })
}

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await UserLogin(email, password);
        const token = createToken(user.email);

        res.cookie("curtoken", token, {
            httpOnly: true,
            maxAge: (process.env.TOKEN_AGE || 3 * 24 * 60 * 60) * 1000 //?3 Days
        })
        res.status(201).json({ email: user.email })
    }catch(err){
        const errors = handleError(err);
        res.status(404).json({ errors });
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

module.exports = { postLogin, getUsers }