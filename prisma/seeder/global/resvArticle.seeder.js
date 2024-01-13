const { prisma } = require("../config")

const article = [
    {
        typeId: 110,
        qty: 2,
        price: 50000,
        resvRoomId: 1,
    }
]

async function resvArticleSeeder() {
    for(art of article){
        await prisma.resvArticle.create({
            data: art
        })
    }
}

module.exports = { resvArticleSeeder }