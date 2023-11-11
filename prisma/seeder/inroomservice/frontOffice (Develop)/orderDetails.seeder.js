const { prisma } = require("../../config");

const orderDetails = [{
    orderId: "OR-1",
    serviceId: 1,
    price: 4000,
    qty: 4,
    created_at: new Date(),
    updated_at: new Date(),
}];

const orderDetailSeeder = async () => {
    for(let detail in orderDetails){
        await prisma.orderDetail.createMany({
            data: orderDetails[detail]
        });
    }
}

module.exports = { orderDetailSeeder };