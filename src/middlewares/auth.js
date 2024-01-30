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
        console.log('Test ')
        const { authorization } = req.headers;
        if (!authorization) return error(res, 'Forbidden authorization token is not found', 403)
        const accessToken = authorization.split(' ')[1];
        const refreshToken = req.cookies['refresh_token'];
        await prisma.userToken.findFirstOrThrow({ where: { refreshToken } })
        const decoded = jwt.verify(accessToken, process.env.SECRET_CODE);
        console.log(decoded)
        const userData = await prisma.user.findUniqueOrThrow({
            where: {
                id: +decoded.sub
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phone: true,
                picture: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        })
        if (roles !== undefined) {
            const isAllowed = roles.some((role) => role === userData.role.name);
            if (!isAllowed) return error(res, 'Forbidden, you are not allowed access this resource', 403);
        }
        req.user = userData
        next();
    } catch (err) {
        console.log(err)
        return error(res, err.message, 401);
    }
}

module.exports = { auth };