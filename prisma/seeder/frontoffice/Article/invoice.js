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
    for (let inv of Invoices) {
        await prisma.invoice.create({
            data: {
                resvRoomId,
                ...inv
            }
        })
    }
}

module.exports = { invoiceSeeder }