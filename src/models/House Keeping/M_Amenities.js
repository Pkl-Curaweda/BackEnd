const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, isDateInRange } = require("../../utils/helper")

const getAllAmenitiesData = async (art, q) => {
    let { page = 1, perPage = 5, from, to } = q, usedLog = []
    try {
        if (from === undefined) from = new Date().toISOString().split("T")[0]
        if (to === undefined) {
            to = new Date(from);
            to.setDate(to.getDate() + 7);
            to = to.toISOString().split('T')[0]
        }
        const data = []
        const dates = generateDateBetweenStartAndEnd(from, to)
        const [stock, usedArticle] = await prisma.$transaction([
            prisma.stock.findFirst({ where: { articleTypeId: +art }, select: { rStock: true } }),
            prisma.articleLog.findMany({
                where: {
                    articleTypeId: +art,
                    dateUsed: { gte: `${from}T00:00:00.000Z` },
                    dateReturn: { lte: `${to}T23:59:59.999Z` }
                },
                select: {
                    dateUsed: true,
                    dateReturn: true,
                    roomId: true,
                    qty: true
                },
                skip: (page - 1) * perPage,
                take: +perPage
            })
        ])
        
        for(date of dates){
            let remain = stock.rStock
            const filteredArticle = usedArticle.filter(article => {
                let [dateUsed, dateReturn] = [article.dateUsed, article.dateReturn]
                return isDateInRange(new Date(date), new Date(`${dateUsed.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${dateReturn.toISOString().split('T')[0]}T23:59:59.999Z`));
              })
            for(let article of filteredArticle){
                remain = remain - article.qty
                usedLog.push({
                    date, roomNo: article.roomId,
                    used: article.qty,
                    remain
                })
            }
        }
        const total = usedLog.length
        let startIndex = (page - 1) * perPage;
        let endIndex = startIndex + perPage - 1;
        startIndex = Math.max(0, startIndex);
        endIndex = Math.min(total - 1, endIndex);

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