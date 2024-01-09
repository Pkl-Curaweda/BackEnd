const prisma = require('../../../prisma/seeder/config.js')
const { error, success } = require('../../utils/response.js')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function index(req, res) {
    try {
        const { page, take, query, orderBy, order } = req.body

        const Discrepancys = await prisma.Discrepancy.findMany({
            take,
            skip: (page - 1) * 10,
            where: {
                OR: [
                    // { id: { contains: query } },
                    // { reservation_Id: { contains: query } },
                    // { reservationId: { contains: query } },
                    // { room: { contains: query } },
                    // { roomId: { contains: query } },
                    // { foAdult: { contains: query } },
                    // { foChild: { contains: query } },
                    // { hkAdult: { contains: query } },
                    // { hkChild: { contains: query } },
                    // { hkStatus: { contains: query } },
                    // { foStatus: { contains: query } },
                    { checker: { contains: query } },
                    { explanation: { contains: query } },
                    // { comment_Id: { contains: query } },
                    // { commentId: { contains: query } },
                ]
            },
            orderBy: {
                [orderBy]: order,
            }
        })

        const count = await prisma.Discrepancy.count()
        const lastPage = Math.ceil(count / take);

        return success(res, 'Get discrepancy success', { lastPage, Discrepancys })
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { index }