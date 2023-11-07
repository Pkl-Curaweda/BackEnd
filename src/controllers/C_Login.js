const jwt = require("jsonwebtoken");
const { Login, GetAllUsers } = require("../models/M_Login");

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_CODE, {
        expiresIn: process.env.TOKEN_AGE || 3 * 24 * 60 * 60
    })
}

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try{
        Login(email, password);
    }catch(err){
        console.log(err);
    }
}

const getUsers = async (req, res) => {
    try{
        const data = GetAllUsers();
        res.status(200).json({
            user: data 
        });
    }catch(err){
        console.log(err);
    }
}

module.exports = { postLogin, getUsers }