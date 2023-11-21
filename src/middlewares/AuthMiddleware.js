const jwt = require("jsonwebtoken");
const { prisma } = require("../../prisma/seeder/config");
const { error } = require("../utils/response");

/**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
 */
const auth = async (req, res, next) => {
    try{
        const accessToken = req.header('Authorization').split(' ')[1];
        const decoded = jwt.verify(accessToken, process.env.SECRET_CODE);
        req.user = await prisma.user.findUniqueOrThrow({
            where: {
                id: parseInt(decoded.sub)
            },
            include: {
                role: true
            }
        })
    }catch(err){
        return error(res, 'Unaunthenticated', 401);
    }
    next();
}


// /**
//    * @param {import('express').Request} req
//    * @param {import('express').Response} res
//    * @param {import('express').NextFunction} next
//  */
// const guestAuth = async (req, res, next) => {
//     try{
//         const accessToken = req.header('Authorization').split(' ')[1];
//         const decoded = jwt.verify(accessToken, process.env.SECRET_CODE);
//         const guest = await prisma.guest.findUniqueOrThrow({
//             where: {
//                 id: parseInt(decoded.sub)
//             }, include: {
//                 Reserver: true
//             }
//         })
//         const roomIds = await getAllRoomIdReservedByReserverId(guest.Reserver.id);
//         req.guest = { guest, roomIds }
//     }catch(err){
//         return error(res, 'Unaunthenticated', 401);
//     }
//     next();
// }

module.exports = { auth };