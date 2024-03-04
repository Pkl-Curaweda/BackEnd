const { prisma } = require("../../config");
const { getCurrentOrderId } = require("./uniqueHandler");

const orderDetails = [{
    orderId: "OR-1",
    serviceId: 1,
    price: 4000,
    qty: 4,
    progress: {
        label: ['Order Proccessed', 'Order is being packaged', 'Order is being delivered', 'Order received', 'Done'],
        finishOn: ['', '', '', '', '']
    },
    created_at: new Date(),
    updated_at: new Date(),
}];

const orderDetailSeeder = async (orderId) => {
    for(let detail of orderDetails){
        detail.orderId = orderId;
        await prisma.orderDetail.createMany({
            data: detail
        });
    }
}

module.exports = { orderDetailSeeder };