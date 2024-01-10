const { prisma } = require("../../config");
const { generateId } = require("./uniqueHandler");

const transactions = [{
    name: "Transaction Name",
    status: "PENDING",
    paymentId: 1,
    orderId: "OR-1",
    created_at: new Date(),
    updated_at: new Date(),
}];

const transactionSeeder = async (orderId) => {
    for (const transaction of transactions) {
        
        transaction.orderId = orderId
        await prisma.transaction.upsert({
            where: {
                orderId: transaction.orderId
            },
            update: { ...transaction },
            create: { ...transaction }
        });
    }
}

module.exports = { transactionSeeder };