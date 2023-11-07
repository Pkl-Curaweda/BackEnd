const jwt = require("jsonwebtoken");
const { UserLogin, GetAllUsers } = require("../models/M_Login");

const handleError = function(err){
    console.log(err.message, err.code);
    let errors = { email: '', password: ''};

    //Incorect email
    if(err.message === 'incorect email')
    {
        errors.email = "that email is not registered"
    }
    if(err.message === 'incorect password')
    {
        errors.password = "that password is incorect"
    }

    //validation erros
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({ properties }) => { //? ({  }) is usefull to access the data inside an array
            errors[properties.path] = properties.message;
        })
    };

    //duplicate erros
    if(err.code === 11000){
        errors.email = 'that email is already been taken';
        return errors;
    }

    return errors;
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_CODE, {
        expiresIn: process.env.TOKEN_AGE || 3 * 24 * 60 * 60
    })
}

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await UserLogin(email, password);
        const token = createToken(user.email);
        res.cookie("CUR_TOKEN", token, {
            httpOnly: true,
            maxAge: (process.env.TOKEN_AGE || 3 * 24 * 60 * 60) * 1000 //?3 Days
        })
        res.status(201).json({ user })
    }catch(err){
        const errors = handleError(err);
        res.status(404).json({ errors });
    }
}

const getUsers = async (req, res) => {
    try{
        const data = await GetAllUsers();
        res.status(200).json({
            data 
        });
    }catch(err){
        console.log(err);
    }
}

module.exports = { postLogin, getUsers }