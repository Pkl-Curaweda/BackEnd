const { prisma } = require("../../config");
const { orderDetailSeeder } = require("./orderDetails.seeder");
const { transactionSeeder } = require("./transaction.seeder");
const { generateId } = require("./uniqueHandler");

const orders = [{
    id: "OR-1",
    guestId: 1,
    roomId: 101,
    subtotal: 400000,
    total: 30000,
    ppn: 50000,
    fees: 378279,
    created_at: new Date(),
    updated_at: new Date(),
}];

const orderSeeder = async () => {
    for (let order of orders) {
        order.id = generateId()
        await prisma.order.createMany({
            data: order
        });
        await orderDetailSeeder(order.id);
        await transactionSeeder(order.id)
    }
}

module.exports = { orderSeeder };