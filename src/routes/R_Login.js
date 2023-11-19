const { Router } = require("express");
const { postLogin, postLogout, getNewUserRefreshToken, getAllUsers, getCurrentUser } = require("../controllers/C_UserLogin");
const { GetQRCode, PostNewGuest } = require("../controllers/C_GuestLogin");
const { auth } = require("../middlewares/AuthMiddleware");
const R_Login = Router();

R_Login.get("/user/", getAllUsers)
R_Login.post("/user/login", postLogin);
R_Login.post('/user/logout', postLogout);
R_Login.get("/user/refresh", getNewUserRefreshToken);
R_Login.get('/user/me', auth , getCurrentUser);

//Guest Login
R_Login.get("/guest/login/:id", GetQRCode);
R_Login.post("/guest/create", PostNewGuest);

module.exports = R_Login;
