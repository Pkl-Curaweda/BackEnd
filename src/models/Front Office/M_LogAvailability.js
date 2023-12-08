const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight } = require("../../utils/helper");

const getLogAvailabilityData = async (dateQuery, skip, limit) => {
    try {
        let logData = [], totalData = 0, originDate, startDate, endDate;
        originDate = new Date();
        longSearchedDate = 3;
        if (dateQuery != "") {
            startDate = new Date(dateQuery.split(' ')[0]).toISOString();
            endDate = new Date(dateQuery.split(' ')[1]).toISOString();
            longSearchedDate = countNight(startDate, endDate)
            originDate = new Date(endDate)
        }
        for (let i = 0; i <= longSearchedDate; i++) {
            const searchedDate = new Date(originDate);
            searchedDate.setDate(searchedDate.getDate() - i);
            const searchDate = searchedDate.toISOString().split('T')[0];
            const logAvailability = await prisma.logAvailability.findFirst({
                where: {
                    created_at: {
                        gte: `${searchDate}T00:00:00.000Z`,
                        lte: `${searchDate}T23:59:59.999Z`
                    }
                }, select: {
                    roomHistory: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: limit,
                skip: skip,
            })
            const roomHistory = logAvailability ? logAvailability.roomHistory : 0;
            const pushedData = {
                date: searchedDate.toISOString().split('T')[0],
                roomHistory
            }
            logData.push(pushedData);
            totalData++
        }
        return {
            logData, totalData
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}


const createNewLogAvailable = async () => {
    try {
        let roomHistory = {};
        const rooms = await prisma.room.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
        for (const room of rooms) {
            const resvRoom = await prisma.resvRoom.findFirst({
                where: {
                    reservation: {
                        onGoingReservation: true
                    },
                    roomId: room.id
                },
                select: {
                    arrangment: {
                        select: {
                            rate: true
                        }
                    },
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
                },
                orderBy: {
                    reservation: {
                        arrivalDate: 'asc'
                    }
                }
            });

            const key = `room_${room.id}`;
            if (resvRoom != null) {
                roomHistory[key] = {
                    "guestName": resvRoom.reservation.reserver.guest.name,
                    "resvStatus": resvRoom.reservation.resvStatus,
                    "roomPrice": resvRoom.arrangment.rate
                };
            } else {
                roomHistory[key] = 0;
            }
        }

        await prisma.logAvailability.create({
            data: { roomHistory }
        })
        return roomHistory
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}


module.exports = { getLogAvailabilityData, createNewLogAvailable }