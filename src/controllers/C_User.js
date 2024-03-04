const { UserLogout, UserLogin, GetAllUsers, forceActivateUserByEmail } = require("../models/Authorization/M_User");
const { RefreshToken } = require("../models/Authorization/M_Token");
const { error, success } = require("../utils/response");
const jwt = require("jsonwebtoken");
const { ThrowError } = require("../utils/helper");
const { getExpireCookieRoom } = require("../models/House Keeping/M_Room");
const { decrypt } = require("../utils/encryption");
const { prisma } = require("../../prisma/seeder/config");

const getAllUsers = async (req, res) => {
    try {
        const users = await GetAllUsers();
        return success(res, 'Succes', users);
    } catch (err) {
        return error(res, err.message)
    }
}

const getCurrentUser = async (req, res) => {
    try {
        return success(res, 'Get Success', req.user);
    } catch (err) {
        return error(res, err.message)
    }
}

const getNewUserRefreshToken = async (req, res) => {
    try {
        const cookie = req.cookies.refresh_token;
        if (cookie === undefined) throw Error("Cookie Didn't Exist")

        const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
        const refreshToken = await RefreshToken("user", cookie, expires);
        const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
            expiresIn: process.env.JWT_EXPIRE,
            subject: refreshToken.userId.toString()
        })
        return success(res, 'Token Refresh Successfully', { accessToken });
    } catch (err) {
        return error(res, err.message, 407)
    }
}


const postLogin = async (req, res) => {
    let { email, password } = req.body, { encryptedData } = req.params;
    let expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
    try {
        if (encryptedData) {
            let decryptedData = decrypt(encryptedData)
            decryptedData = JSON.parse(decryptedData)
            email = decryptedData.email
            password = decryptedData.password
            expires = await getExpireCookieRoom(email)
        }
        const payload = await UserLogin(email, password);
        res.cookie('refresh_token', payload.createdToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires
        });
        const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
            expiresIn: process.env.JWT_EXPIRE,
            subject: payload.user.id.toString()
        });

        delete payload.user.password;
        return success(res, `Login Success as ${payload.user.name}`, { user: payload.user, path: payload.path, accessToken });
    } catch (err) {
        return error(res, err.message)
    }
}

const postLogout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token
        await UserLogout(refreshToken);
        res.clearCookie('refresh_token');
        return success(res, 'Logout sucess')
    } catch (err) {
        return error(res, err.message)
    }
}

const forceActivate = async (req, res) => {
    try{
        const activate = await forceActivateUserByEmail(req.body)
        return success(res, 'User Activacted', activate)
    }catch(err){
        return error(res, err.message)
    }
}



module.exports = { postLogin, getNewUserRefreshToken, postLogout, getAllUsers, getCurrentUser, forceActivate }