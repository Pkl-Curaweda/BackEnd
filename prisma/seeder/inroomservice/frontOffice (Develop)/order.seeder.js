const { prisma } = require("../../config");
const { orderDetailSeeder } = require("./orderDetails.seeder");
const { transactionSeeder } = require("./transaction.seeder");
const { generateId } = require("./uniqueHandler");

const orders = [{
    roomId: 101,
    paymentMethod: "CASH",
    resvRoomId: 1,
    subtotal: 400000,
    total: 30000,
    ppn: 50000,
    fees: 378279
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