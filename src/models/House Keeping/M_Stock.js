const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const reduceRemainingStock = async (articleTypeId, used) => {
    try{
        const stockExist = await prisma.stock.findFirst({ where: { articleTypeId }})
        if(stockExist === null) return false
        const remain = stockExist.remain - used
        return await prisma.stock.update({ where: { articleTypeId }, data: { remain } })
    }catch(err){
        ThrowError(err)
    }finally{ await PrismaDisconnect()}
}

const getAvailableArticleAndStock = async (perPage, page) => {
    try{
        const listOfArticle = []
        const article = await prisma.articleType.findMany({ where: { NOT: [ { id: { gte: 998 } }] }, select: { id: true, price: true, description: true, Stock: { select: { remain: true } } }, orderBy: { id: 'asc' }, take: +perPage, skip: (+page - 1) * perPage })
        for(let art of article){
            listOfArticle.push({
                id: art.id,
                description: art.description,
                price: art.price,
                stock: art.Stock.length != 0 ?  art.Stock[0].remain : 99
            })
        }
        return listOfArticle
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { reduceRemainingStock, getAvailableArticleAndStock }