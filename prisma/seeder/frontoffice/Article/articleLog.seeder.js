const { prisma } = require("../../config")

const articleLogs = [
    {
        dateUsed: '2024-01-01T00:00:00.000Z',
        dateReturn: '2024-01-03T23:59:59.999Z',
        qty: 2,
        articleType: {
            connect: { id: 110 }
        },
    }
]

async function articleLogsSeed(){
    for(al of articleLogs){
        await prisma.articleLog.create({
            data: al
        })
    }
}

module.exports = { articleLogsSeed }