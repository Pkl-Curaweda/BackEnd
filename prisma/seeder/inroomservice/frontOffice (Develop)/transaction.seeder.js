const { prisma } = require("../../config");
const { orderSeeder } = require("./order.seeder");
const { generateId } = require("./uniqueHandler");

const transactions = [{
    id: "TR-01",
    name: "Transaction Name",
    status: "PENDING",
    paymentId: 1,
    created_at: new Date(),
    updated_at: new Date(),
}];

const transactionSeeder = async () => {
    for (const transaction of transactions) {
        const transactionId = transaction.id = generateId();
        await prisma.transaction.createMany({
            data: transaction
        });
        await orderSeeder(transactionId);
    }
}

module.exports = { transactionSeeder };