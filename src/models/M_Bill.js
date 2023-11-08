const { PrismaClient } = require("@prisma/client");
const billClient = new PrismaClient().order;

const getAllBillFromReservationId = async (reservationId) => {
    const bills = await billClient.findMany({
        where: {
            reservationId
        }
    })
    return bills;
}

module.exports = { getAllBillFromReservationId };