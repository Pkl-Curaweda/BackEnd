const { UserLogout, UserLogin, GetAllUsers } = require("../models/M_User");
const { CreateAndAssignToken, RefreshToken } = require("../models/M_UserToken");
const { error, success } = require("../utils/response");
const jwt = require("jsonwebtoken")

const postLogin = async (req, res) => {
    const body = req.body;
    const userAndGeneratedToken = await UserLogin(body.email, body.password);
    const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
    res.cookie('refresh_token', userAndGeneratedToken.createToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires
    });
    const acessToken = jwt.sign({}, process.env.SECRET_CODE, {
        expiresIn: '15m',
        subject: userAndGeneratedToken.user.id.toString()
    });

    delete userAndGeneratedToken.user.password;
    return success(res, 'Login Success', { user: userAndGeneratedToken.user , acessToken });
}

const postLogout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token
        await UserLogout(refreshToken);
    } catch (err) {
        return error(res, err)
    } finally {
        res.clearCookie('refresh_token');
        return success(res, 'Logout sucess')
    }
}

const getNewUserRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookie.refresh_token;
        const newRefreshToken = await RefreshToken("user", refreshToken);
        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: process.env.TOKEN_AGE
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

const getAllUsers = async (req, res) => {
    const users = await GetAllUsers();
    return success(res, 'Succes', users);
}

module.exports = { postLogin, getNewUserRefreshToken, postLogout, getAllUsers }