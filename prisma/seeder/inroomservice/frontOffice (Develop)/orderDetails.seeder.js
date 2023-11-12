const { prisma } = require("../../config");
const { getCurrentOrderId } = require("./uniqueHandler");

const orderDetails = [{
    orderId: "OR-1",
    serviceId: 1,
    price: 4000,
    qty: 4,
    created_at: new Date(),
    updated_at: new Date(),
}];

const orderDetailSeeder = async (orderId) => {
    for(let detail in orderDetails){
        orderDetails[detail].orderId = orderId;
        await prisma.orderDetail.createMany({
            data: orderDetails[detail]
        });
    }
}

module.exports = { orderDetailSeeder };