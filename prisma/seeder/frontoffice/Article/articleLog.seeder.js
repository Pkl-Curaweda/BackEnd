const { randomInt } = require("crypto")
const { prisma } = require("../../config")

const articleLogs = [
    {
        qty: 2,
        room: { connect: { id: 1 } },
        articleType: {
            connect: { id: 110 }
        },
    },
    {
        qty: 3,
        room: { connect: { id: 1 } },
        articleType: {
            connect: { id: 109 }
        },
    },
    {
        qty: 2,
        room: { connect: { id: 1 } },
        articleType: {
            connect: { id: 108 }
        },
    }
]

async function articleLogsSeed() {
    const from = new Date().toISOString().split('T')[0]
    let to = new Date(from)
    to.setDate(to.getDate() + randomInt(1, 10))
    to = to.toISOString().split('T')[0]

    for (al of articleLogs) {
        await prisma.articleLog.create({
            data: {
                dateUsed: `${from}T00:00:00.000Z`,
                dateReturn: `${to}T23:59:59.999Z`,
                ...al
            }
        })
    }
}

module.exports = { articleLogsSeed }