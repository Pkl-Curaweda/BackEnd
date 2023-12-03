const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

const createNewLogAvailable = async () => {
    try {
        let roomIdList = [], roomHistory = {};
        const todayDate = new Date().toISOString().split("T")[0];
        const gteLte = {
            gte: `${todayDate}T00:00:00.000Z`,
            lte: `${todayDate}T23:59:59.999Z`
        }
        // const alreadyExist = await prisma.logAvailability.findFirst({ where: { created_at: gteLte } })
        // if(alreadyExist){
        const rooms = await prisma.room.findMany({ select: { id: true } });
        rooms.forEach(room => {
            roomIdList.push(room.id)
        })
        for (const roomId of roomIdList) {
            const resvRoom = await prisma.resvRoom.findFirst({
                where: {
                    // reservation: {
                    //     arrivalDate: gteLte,
                    //     departureDate: gteLte
                    // },
                    roomId
                },
                select: {
                    reservation: {
                        select: {
                            reserver: {
                                select: {
                                    guest: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            },
                            resvStatus: {
                                select: {
                                    rowColor: true,
                                    textColor: true
                                }
                            },
                        }
                    }
                }
            })
            console.log(resvRoom);
            const key = `room_${roomId}`;
            if (resvRoom != null) {
                roomHistory[key] = {
                    "guestName": resvRoom.reservation.reserver.guest.name,
                    "resvStatus": resvRoom.reservation.resvStatus
                };
            } else {
                roomHistory[key] = ""
            }
        }
        return roomHistory
        // }else{
        //     throw Error('Log Already Created');
        // }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}

module.exports = { createNewLogAvailable }