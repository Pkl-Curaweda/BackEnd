const { prisma } = require("../../config");

const transactions = [{
    id: "TS-01",
    name: "Transaction Name",
    status: "PENDING",
    paymentId: 1,
    created_at: new Date(),
    updated_at: new Date(),
}];

const transactionSeeder = async () => {
    for(let transaction in transactions){
        await prisma.transaction.createMany({
            data: transactions[transaction]
        });
    }
}

module.exports = { transactionSeeder };