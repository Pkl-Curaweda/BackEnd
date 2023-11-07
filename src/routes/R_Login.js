const { Router } = require("express");
const { getUsers, postLogin } = require("../controllers/C_Login");

const authRouter = Router();

authRouter.post('/', postLogin)
authRouter.get('/', getUsers)

module.exports = authRouter