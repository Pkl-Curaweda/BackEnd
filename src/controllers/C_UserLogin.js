const { UserLogout, UserLogin, GetAllUsers } = require("../models/Authorization/M_User");
const { RefreshToken } = require("../models/Authorization/M_Token");
const { error, success } = require("../utils/response");
const jwt = require("jsonwebtoken")

const postLogin = async (req, res) => {
    const body = req.body;
    let userAndGeneratedToken
    try{
        userAndGeneratedToken = await UserLogin(body.email, body.password);
    }catch(err){
        return error(res, err.message, 404);
    }
    const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
    res.cookie('refresh_token', userAndGeneratedToken.createdToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires
    });
    const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
        expiresIn: '15m',
        subject: userAndGeneratedToken.user.id.toString()
    });

    delete userAndGeneratedToken.user.password;
    return success(res, 'Login Success', { user: userAndGeneratedToken.user, accessToken });
}

const postLogout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token
        await UserLogout(refreshToken);
    } catch {
        return error(res, 'Invalid refresh token')
    } finally {
        res.clearCookie('refresh_token');
        return success(res, 'Logout sucess')
    }
}

const getAllUsers = async (req, res) => {
    const users = await GetAllUsers();
    return success(res, 'Succes', users);
}

const getCurrentUser = async (req, res) => {
    return success(res, 'Operation Success', req.user);
}

const getNewUserRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
        const newRefreshToken = await RefreshToken("user", refreshToken, expires);
        res.cookie('refresh_token', newRefreshToken.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires
        })
        const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
            expiresIn: '15m',
            subject: newRefreshToken.userId.toString()
        })
        return success(res, 'Refresh token success', { accessToken });
    } catch (err) {
        return error(res, err, 401)
    }
}

module.exports = { postLogin, getNewUserRefreshToken, postLogout, getAllUsers, getCurrentUser }