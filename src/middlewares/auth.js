const jwt = require("jsonwebtoken");
const { prisma } = require("../../prisma/seeder/config");
const { error } = require("../utils/response");

/**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
 */
const auth = (roles) => async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) return error(res, 'Forbidden authorization token is not found', 403)
        const accessToken = req.headers['authorization'].split(' ')[1];
        const refreshToken = req.cookies['refresh_token'];

        await prisma.userToken.findFirstOrThrow({ where: { refreshToken } })
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
                role: {
                    select: {
                        name: true
                    }
                }
            }
        })
        req.user = userData
    } catch (err) {
        console.log(err)
        return error(res, err.message, 401);
    }
    next();
}

module.exports = { auth };