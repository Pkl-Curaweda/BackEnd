const { Router } = require("express");
const { getUsers, postLogin } = require("../controllers/C_Login");
const R_Login = Router();

R_Login.post("/", postLogin);
R_Login.get("/", getUsers);

module.exports = R_Login;