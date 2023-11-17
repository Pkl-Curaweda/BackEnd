const { Router } = require("express");
const { getUsers, postLogin, postLogout } = require("../controllers/C_Login");
const R_Login = Router();

R_Login.get("/", getUsers);
R_Login.post("/login", postLogin);
R_Login.post('/logout', postLogout);

module.exports = R_Login;
