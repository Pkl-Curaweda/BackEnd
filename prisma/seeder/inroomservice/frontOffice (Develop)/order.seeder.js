const { prisma } = require("../../config");

const orders = [{
    id: "OR-1",
    guestId: 1,
    roomId: 1,
    subtotal: 400000,
    total: 30000,
    ppn: 50000,
    fees: 378279,
    status: "PENDING",
    transactionId: "TS-01",
    created_at: new Date(),
    updated_at: new Date(),
}];

const orderSeeder = async () => {
    for(let order in orders){
        await prisma.order.createMany({
            data: orders[order]
        });
    }
}

module.exports = { orderSeeder };