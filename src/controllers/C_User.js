const { UserLogout, UserLogin, GetAllUsers } = require("../models/Authorization/M_User");
const { RefreshToken } = require("../models/Authorization/M_Token");
const { error, success } = require("../utils/response");
const jwt = require("jsonwebtoken")

const getAllUsers = async (req, res) => {
    try{
        const users = await GetAllUsers();
        return success(res, 'Succes', users);
    }catch(err){
        return error(res, err.message)
    }
}

const getCurrentUser = async (req, res) => {
    try{
        return success(res, 'Operation Success', req.user);
    }catch(err){
        return error(res, err.message)
    }
}

const getNewUserRefreshToken = async (req, res) => {
    try {
        const cookie = req.cookies.refresh_token;
        if(cookie === undefined) throw Error("Cookie Didn't Exist")
        
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
        return success(res, 'Refresh token success', { accessToken });
    } catch (err) {
        return error(res, err.message, 401)
    }
}

const postLogin = async (req, res) => {
    const body = req.body;
    let userAndGeneratedToken
    try {
        userAndGeneratedToken = await UserLogin(body.email, body.password);
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
    } catch (err) {
        return error(res, err.message, 404)
    }
}

const postLogout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token
        await UserLogout(refreshToken);
    } catch (err) {
        return error(res, err.message)
    } finally {
        res.clearCookie('refresh_token');
        return success(res, 'Logout sucess')
    }
}

const getNotification = async (req, res) => {
    try{
      
    }catch(err){
      return error(res, err.message)
    }
  }

module.exports = { postLogin, getNewUserRefreshToken, postLogout, getAllUsers, getCurrentUser }