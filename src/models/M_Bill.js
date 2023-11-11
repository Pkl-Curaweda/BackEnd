const { PrismaClient } = require("@prisma/client");
const orderClient = new PrismaClient().order;
const reservationClient = new PrismaClient().reservation;

const getAllOrderFromReservationId = async (reservationId) => {
    const reserver = await reservationClient.findFirst({
        where: {
            id: parseInt(reservationId)
        },
        select: {
            reserver: {
                select: {
                    guestId: true
                }
            }
        }
    })
    const orders = await getAllOrderFromGuestId(reserver.reserver.guestId);
    return orders;
}

const getAllOrderFromGuestId = async (guestId) => {
    const orders = orderClient.findMany({
        where: {
            guestId
        },
        select: {
            orderDetails: {
                select: {
                    qty: true,
                    service: {
                        select: {
                            name: true,
                            price: true
                        }
                    }
                }
            }
        }
    })
    return orders;
}

module.exports = { getAllOrderFromReservationId };