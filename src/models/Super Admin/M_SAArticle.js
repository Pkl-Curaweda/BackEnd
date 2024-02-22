const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatCurrency } = require("../../utils/helper")
const { createNewStock, updateRealStock } = require("../House Keeping/M_Stock")

const getSAArticleData = async (query) => {
    let { search = undefined, art = "0" } = query, sendedData = { table: undefined, detail: undefined }
    try {
        const articles = await prisma.articleType.findMany({ where: { description: { contains: search }, NOT: [ { id: { gte: 998 } }], deleted: false }, select: { id: true, description: true, price: true, Stock: { select: { rStock: true, remain: true } } }, orderBy: { updated_at: 'desc' } })
        sendedData.table = articles.map(article => ({
            artNo: article.id,
            description: article.description,
            stock: article.Stock.length > 0 ? article.Stock[0].rStock : "Unlimited",
            remain: article.Stock.length > 0 ? article.Stock[0].remain : "Unlimited",
            price: formatCurrency(article.price)
        }))
        if (art != "0") {
            const detailArt = await prisma.articleType.findFirstOrThrow({ where: { id: +art }, select: { id: true, price: true, description: true, Stock: true } })
            sendedData.detail = {
                artNo: detailArt.id,
                price: detailArt.price,
                stock: detailArt.Stock.length > 0 ? detailArt.Stock[0].rStock : undefined,
                description: detailArt.description
            }
        }
        return sendedData
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addEditArticle = async (body, act) => {
    let { artNo, price, description, stock } = body, message = `Edit article ${artNo} success`
    try {
        const exist = await prisma.articleType.findFirst({ where: { id: artNo } })
        if (!(act != "add")) {
            if (exist != null) throw Error('Article already exist')
            message = `Create article ${artNo} success`
        } else {
            const stockData = await prisma.stock.findFirst({ where: { articleTypeId: +artNo } })
            if (stockData === null && stock != undefined) {
                await createNewStock(exist.id, stock)
            } else {
                if (stock != undefined && stockData.rStock != stock) await updateRealStock(stockData.id, stock)
            }
        }
        const data = await prisma.articleType.upsert({ where: { id: artNo }, update: { price, description }, create: { id: artNo, price, description } })
        if(act === "add") await createNewStock(data.id, stock)
        return { message, data }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteArticleById = async (id) => {
    try {
        const exist = await prisma.articleType.findFirstOrThrow({ where: { id } })
        return await prisma.articleType.update({ where: { id }, data: { deleted: true } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSAArticleData, addEditArticle, deleteArticleById }