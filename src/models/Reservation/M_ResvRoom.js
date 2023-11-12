const orderClient = require('../Helpers/Config/In Room/OrderConfig');
const reservationClient = require('../Helpers/Config/Front Office/ReservationConfig');
const { ThrowError } = require('../Helpers/ThrowError');
const { PrismaDisconnect } = require('../Helpers/DisconnectPrisma');

const getAllOrderFromReservationId = async (reservationId) => {
    try {
        const reservation = await reservationClient.findFirst({
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
        const orders = await getAllOrderFromGuestId(reservation.reserver.guestId);
        return orders;
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const getAllOrderFromGuestId = async (guestId) => {
    try {
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
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

module.exports = { getAllOrderFromReservationId };