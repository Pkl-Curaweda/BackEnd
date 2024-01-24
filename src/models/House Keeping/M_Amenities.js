const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, isDateInRange } = require("../../utils/helper")

const getAllAmenitiesData = async (art, q) => {
    let { page = 1, perPage = 5, from, to } = q, usedLog = []
    console.log(q)
    try {
        if (from === undefined) from = new Date().toISOString().split("T")[0]
        if (to === undefined) {
            to = new Date(from);
            to.setDate(to.getDate() + 7);
            to = to.toISOString().split('T')[0]
        }
        const dates = generateDateBetweenStartAndEnd(from, to)
        console.log(dates)
        const [stock, usedArticle] = await prisma.$transaction([
            prisma.stock.findFirst({ where: { articleTypeId: +art }, select: { rStock: true } }),
            prisma.invoice.findMany({
                where: {
                    articleTypeId: +art,
                    OR: [
                        { dateUsed: { gte: `${from}T00:00:00.000Z` } },
                        { dateReturn: { lte: `${to}T23:59:59.999Z` } }
                    ]
                },
                select: {
                    dateUsed: true,
                    dateReturn: true,
                    resvRoom: { select: { roomId: true } },
                    qty: true
                },
                skip: (page - 1) * perPage,
                take: +perPage
            })
        ])
        console.log(usedArticle)

        for (date of dates) {
            let remain = stock.rStock
            const filteredArticle = usedArticle.filter(article => {
                let [dateUsed, dateReturn] = [article.dateUsed, article.dateReturn]
                return isDateInRange(new Date(date), new Date(`${dateUsed.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${dateReturn.toISOString().split('T')[0]}T23:59:59.999Z`));
            })
            for (let article of filteredArticle) {
                remain = remain - article.qty
                usedLog.push({
                    date, roomNo: article.resvRoom.roomId,
                    used: article.qty,
                    remain
                })
            }
        }
        const total = usedLog.length
        startIndex = Math.max(0, (page - 1) * perPage);
        endIndex = Math.min(usedLog.length - 1, (startIndex + perPage - 1));
        usedLog.slice(startIndex, endIndex)

        const lastPage = Math.ceil(total / perPage);
        return {
            extra: usedLog, meta: {
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

module.exports = { getAllAmenitiesData }