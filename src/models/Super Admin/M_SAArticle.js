const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatCurrency } = require("../../utils/helper")

const getSAArticleData = async (query) => {
    const { search, art } = query, sendedData = { table: undefined, detail: undefined }
    try {
        const articles = await prisma.articleType.findMany({ where: { description: { contains: (search != "" && search) } }, select: { id: true, description: true, price: true } })
        sendedData.table = articles.map(article => ({
            artNo: article.id,
            description: article.description,
            price: formatCurrency(article.price)
        }))
        if (art != "0") {
            const detailArt = await prisma.articleType.findFirstOrThrow({ where: { id: true, price: true, description: true } })
            sendedData.detail = {
                artNo: detailArt.id,
                price: detailArt.price,
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
    let { artNo, price, description } = body, message = `Edit article ${artNo} success`
    try {
        if (!(act != "add")) {
            const exist = await prisma.articleType.findFirst({ where: { id: artNo } })
            if (exist != null) throw Error('Article already exist')
            message = `Create article ${artNo} success`
        }
        const data = await prisma.articleType.upsert({ where: { id: artNo }, update: { price, description }, create: { id: artNo, price, description } })
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
        return await prisma.articleType.delete({ where: { id } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSAArticleData, addEditArticle, deleteArticleById }