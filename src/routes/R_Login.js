const { Router } = require("express");
const { postLogin, postLogout, getNewUserRefreshToken, getAllUsers } = require("../controllers/C_UserLogin");
const { GetQRCode, PostNewGuest } = require("../controllers/C_GuestLogin");
const R_Login = Router();

R_Login.get("/user/", getAllUsers)
R_Login.post("/user/login", postLogin);
R_Login.post('/user/logout', postLogout);
R_Login.get("/user/refresh", getNewUserRefreshToken);

//Guest Login
R_Login.get("/guest/login/:id", GetQRCode);
R_Login.post("/guest/create", PostNewGuest);

module.exports = R_Login;
