const { Router } = require("express");
const { postLogin, postLogout, getNewUserRefreshToken, getAllUsers, getCurrentUser, forceActivate, createQR, downloadQrCodes } = require("../controllers/C_User");
const { GetQRCode, PostNewGuest, GetAllGuest, PostLogin } = require("../controllers/C_Guest");
const { auth } = require("../middlewares/auth");
const { getAllNotification, getUnreadMessage } = require("../controllers/C_Notification");
const { validateLogin } = require("../validations/login.validation");
const { CheckToken } = require("../models/Authorization/M_Token");
const { error } = require("../utils/response");
const R_Login = Router();

//Token
R_Login.get('/check-token', async (req, res, next) => {
    try {
        await CheckToken()
        next()
    } catch (err) { return error(res, err.message) }
})

//User
R_Login.get("/user", getAllUsers)
R_Login.post("/user/login/:encryptedData?", (req, res, next) => {
    if (!req.params.encryptedData) validateLogin
    next()
}, postLogin);
R_Login.post('/user/logout', postLogout);
R_Login.get("/user/refresh", getNewUserRefreshToken);
R_Login.get('/user/me', auth(), getCurrentUser);
R_Login.get('/user/qr-download/:encrypt', downloadQrCodes)
R_Login.post('/user/force', forceActivate)
R_Login.post('/user/qr-create', auth(['createSuperAdmin']), createQR)

//Guest Login
R_Login.get("/guest/", GetAllGuest);
R_Login.get("/guest/qr/:id", GetQRCode);
R_Login.post("/guest/create", PostNewGuest);
R_Login.post("/guest/login/:method/:encrypt?", PostLogin);

module.exports = R_Login;
