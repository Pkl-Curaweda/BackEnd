const jwt = require("jsonwebtoken");
const { prisma } = require("../../prisma/seeder/config");
const { error } = require("../utils/response");

/**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
 */
const auth = async (req, res, next) => {
    try {
        const accessToken = req.header('Authorization').split(' ')[1];
        const decoded = jwt.verify(accessToken, process.env.SECRET_CODE);
        const userData = await prisma.user.findUniqueOrThrow({
            where: {
                id: parseInt(decoded.sub)
            },
            select: {
                username: true,
                email: true,
                name: true,
                picture: true,
                role: true
            }
        })
        req.user = userData
    } catch (err) {
        console.log(err)
        return error(res, 'Unaunthenticated', 401);
    }
    next();
}

module.exports = { auth };