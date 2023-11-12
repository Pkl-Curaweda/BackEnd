const { prisma } = require("../../config");
const { orderDetailSeeder } = require("./orderDetails.seeder");
const { getCurrentTransactionId, generateUniqueOrderId, generateId } = require("./uniqueHandler");

const orders = [{
    id: "OR-1",
    guestId: 1,
    roomId: 1,
    subtotal: 400000,
    total: 30000,
    ppn: 50000,
    fees: 378279,
    status: "PENDING",
    transactionId: "TR-01",
    created_at: new Date(),
    updated_at: new Date(),
}];

const orderSeeder = async (transactionId) => {
    for(let order in orders){
        const alreadyExisted = await prisma.order.findUnique({
            where: {
                id: orders[order].id
            }
        })
        if(alreadyExisted){
            const orderId = orders[order].id = generateId();
            orders[order].transactionId = transactionId;
            await prisma.order.createMany({
                data: orders[order]
            });
            await orderDetailSeeder(orderId);
        }
    }
}

module.exports = { orderSeeder };