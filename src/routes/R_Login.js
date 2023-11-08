const { getUsers, postLogin } = require("../controllers/C_Login");
const { Router } = require("express");
const R_auth = Router();

R_auth.post("/", postLogin);
R_auth.get("/", getUsers);

module.exports = R_auth;
