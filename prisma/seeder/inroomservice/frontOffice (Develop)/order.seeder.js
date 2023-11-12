const { prisma } = require("../../config");
const { orderDetailSeeder } = require("./orderDetails.seeder");
const { generateId } = require("./uniqueHandler");

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
    try{
        for(let order of orders){
            const alreadyExisted = await prisma.order.findUnique({
                where: {
                    id: order.id
                }
            })
            if(!alreadyExisted){
                const orderId = order.id = generateId();
                order.transactionId = transactionId;
                await prisma.order.createMany({
                    data: order
                });
                await orderDetailSeeder(orderId);
            }
        }
    }catch(err){
        console.log(err)
    }
}

module.exports = { orderSeeder };