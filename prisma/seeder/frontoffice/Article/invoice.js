const { randomInt } = require("crypto");
const { prisma } = require("../../config");

const Invoices = [
    {
        articleTypeId: 110 ,
        qty: randomInt(1, 3),
        rate: 50000
    },
    {
        articleTypeId: 109,
        qty: randomInt(1, 3),
        rate: 15000
    },
    {
        articleTypeId: 108 ,
        qty: randomInt(1, 2),
        rate: 15000
    },
    {
        articleTypeId: 998,
        qty: 1,
        rate: 450000
    }
]

async function invoiceSeeder(resvRoomId) {
    const dateUsed = new Date()
    const dateReturn = new Date(dateUsed)
    dateReturn.setDate(dateReturn.getDate() + 7)
    for (let inv of Invoices) {
        await prisma.invoice.create({
            data: {
                resvRoomId,
                ...inv,
                dateUsed,
                dateReturn
            }
        })
    }
}

module.exports = { invoiceSeeder }