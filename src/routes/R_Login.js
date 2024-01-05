const { Router } = require("express");
const { postLogin, postLogout, getNewUserRefreshToken, getAllUsers, getCurrentUser } = require("../controllers/C_User");
const { GetQRCode, PostNewGuest, GetAllGuest, PostLogin } = require("../controllers/C_Guest");
const { auth } = require("../middlewares/auth");
const R_Login = Router();

R_Login.get("/user/", getAllUsers)
R_Login.post("/user/login", postLogin);
R_Login.post('/user/logout', postLogout);
R_Login.get("/user/refresh", getNewUserRefreshToken);
R_Login.get('/user/me', auth , getCurrentUser);

//Guest Login
R_Login.get("/guest/", GetAllGuest);
R_Login.get("/guest/qr/:id", GetQRCode);
R_Login.post("/guest/create", PostNewGuest);
R_Login.post("/guest/login/:method/:encrypt?", PostLogin);

module.exports = R_Login;
