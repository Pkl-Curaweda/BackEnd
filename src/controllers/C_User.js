const { UserLogout, UserLogin, GetAllUsers } = require("../models/Authorization/M_User");
const { RefreshToken } = require("../models/Authorization/M_Token");
const { error, success } = require("../utils/response");
const jwt = require("jsonwebtoken")

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
        const newRefreshToken = await RefreshToken("user", cookie, expires);
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
        return success(res, 'Token Refresh Successfully', { accessToken });
    } catch (err) {
        return error(res, err.message, 405)
    }
}

const postLogin = async (req, res) => {
    const body = req.body;
    try {
        const payload = await UserLogin(body.email, body.password);
        const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
        res.cookie('refresh_token', payload.createdToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires
        });
        const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
            expiresIn: '15m',
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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function create(req, res) {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10)
      const user = await userRepository.create(req.body)
      return success(res, 'Create user success', user)
    } catch {
      return error(res, 'Create user failed')
    }
  }


module.exports = { postLogin, getNewUserRefreshToken, postLogout, getAllUsers, getCurrentUser }