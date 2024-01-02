const { prisma } = require("../../../prisma/seeder/config");
const { PrismaDisconnect, ThrowError } = require("../../utils/helper");
const { getAllAvailableRoom } = require("../House Keeping/M_Room");

const get = async (date, skip, take) => {
    try {
        const current = new Date();
        date = date || current.toISOString().split("T")[0]
        currTime = `${current.getHours()}:${current.getMinutes()}`
        currDate = current.toDateString();

        console.log(currTime, currDate)
        let data = {
            newReservation: 0, //?New reservation from?
            availableRoom: 0,
            checkIn: 0,
            checkOut: 0,
            occRate: 0
        }

        const availableRoom = await getAllAvailableRoom()
        data.availableRoom = availableRoom.length
        data.occRate = availableRoom.length / 10
        console.log(data)
        const recResv = await prisma.resvRoom.findMany({
            where: {
                created_at: {
                    gte: `${date}T00:00:00.000Z`,
                    lte: `${date}T23:59:59.999Z`
                }
            },
            select: {
                reservationId: true,
                reservation: {
                    select: {

                        reserver: {
                            select: {
                                resourceName: true,
                                guest: { select: { name: true } }
                            }
                        }
                    }
                }
            },
            skip, take
        })
        return { currTime, currDate, data, recResv, }
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

module.exports = { get }