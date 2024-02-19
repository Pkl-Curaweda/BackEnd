const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatCurrency } = require("../../utils/helper")
const { error } = require("../../utils/response")

const getSAArticleData = async (query) =>{
    const { search, art } = query, sendedData = { table: undefined, detail:undefined }
    try{
        const articles = await prisma.articleType.findMany({ select: { id: true, description: true, price: true } })
        sendedData.table = articles.map(article => ({
            artNo: article.id, 
            description: article.description,
            price: formatCurrency(article.price)
        }))
        if(art != 0) art = articles[0].id
        const detailArt = await prisma.articleType.findFirstOrThrow({ where: { id: true, price: true, description: true } })
        c 
    }catch(err){
       ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}