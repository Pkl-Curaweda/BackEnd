const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getAllExtraBedData = async (art, q) => {
    let { page = 1, perPage = 5, from, to } = q
    try {
        if (from === undefined) from = new Date().toISOString().split("T")[0]
        if (to === undefined) {
            to = new Date(from);
            to.setDate(to.getDate() + 7);
            to = to.toISOString().split('T')[0]
        }
        const data = []
        const [total, invoice] = await prisma.$transaction([
            prisma.invoice.count({ where: { articleTypeId: +art, created_at: { gte: `${from}T00:00:00.000Z`, lte: `${to}T23:59:59.999Z` } } }),
            prisma.invoice.findMany({
                where: {
                    articleTypeId: +art,
                    created_at: {
                        gte: `${from}T00:00:00.000Z`,
                        lte: `${to}T23:59:59.999Z`
                    }
                },
                select: {
                    created_at: true,
                    resvRoom: {
                        select: { roomId: true }
                    },
                    qty: true
                },
                skip: (page - 1) * perPage,
                take: +perPage
            })
        ])
        for (let inv of invoice) {
            const { created_at } = inv
            data.push({
                date: created_at.toISOString().split("T")[0],
                roomNo: inv.resvRoom.roomId,
                used: inv.qty,
                remain: "NEED TO BE CHANGED"
            })
        }
        const lastPage = Math.ceil(total / perPage);
        return {
            extra: data, meta: {
                total,
                currPage: +page,
                lastPage,
                perPage,
                prev: page > 1 ? page - 1 : null,
                next: page < lastPage ? page + 1 : null
            }
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getAllExtraBedData }