const jwt = require("jsonwebtoken");
const { prisma } = require("../../prisma/seeder/config");
const { error } = require("../utils/response");

/**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
 */
const auth = (access) => async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) return error(res, 'Forbidden authorization token is not found', 403)
        const accessToken = authorization.split(' ')[1];
        const refreshToken = req.cookies['refresh_token'];
        await prisma.userToken.findFirstOrThrow({ where: { refreshToken } })
        const decoded = jwt.verify(accessToken, process.env.SECRET_CODE);
        const userData = await prisma.user.findUniqueOrThrow({
            where: {
                deleted: false,
                id: +decoded.sub
            },
            select: {
                canLogin: true,
                id: true,
                username: true,
                email: true,
                name: true,
                lastCheckNotif: true,
                phone: true,
                picture: true,
                guestId: true,
                roomId: true,
                resvRoomId: true,
                cartList: true,
                serviceShown: true,
                role: {
                    select: {
                        name: true,
                        access: true
                    }
                }
            }
        })
        if(userData.canLogin != true) return error(res, 'This account cannot be used', 410)
        if (access !== undefined) {
            const userAllowedAccess = Object.keys(userData.role.access)
            const isAccessible = access.some((acc) => userAllowedAccess.includes(acc))
            console.log(isAccessible)
            if (!isAccessible) return error(res, 'Forbidden, you have no access to this resource', 403)
        }
        req.user = userData
        next();
    } catch (err) {
        return error(res, err.message, 401);
    }
}

module.exports = { auth };