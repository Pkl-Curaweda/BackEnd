const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd } = require("../../utils/helper");

const getLogAvailabilityData = async (dateQuery, page, perPage) => {
    try {
        let logData = [], totalData = 0, originDate, startDate, endDate, dates;
        originDate = new Date();
        let startIndex = (page - 1) * perPage;
        let endIndex = startIndex + perPage - 1;
        if (dateQuery != "") {
            startDate = new Date(dateQuery.split(' ')[0]).toISOString();
            endDate = new Date(dateQuery.split(' ')[1]).toISOString();
            dates = generateDateBetweenStartAndEnd(startDate, endDate)
        } else {
            dates = generateDateBetweenNowBasedOnDays("past", 7) //?7 DAYS BEFORE NOW
        }
        startIndex = Math.max(0, startIndex);
        endIndex = Math.min(dates.length - 1, endIndex);

        console.log(dates)
        for (let i = startIndex; i <= endIndex; i++) {
            const searchedDate = new Date(dates[i]);
            const searchDate = searchedDate.toISOString().split("T")[0];
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
                }
            })
            const roomHistory = logAvailability ? logAvailability.roomHistory : 0;
            const pushedData = {
                date: searchedDate.toISOString().split('T')[0],
                roomHistory
            }
            logData.push(pushedData);
        }
        const lastPage = Math.ceil(dates.length / perPage);
        return {
            logData,
            meta: {
                total: dates.length,
                currPage: page,
                lastPage,
                perPage,
                prev: page > 0 ? page - 1 : null,
                next: page < lastPage ? page + 1 : null
            }
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

//? FILTER - ROOM AVAILABILITY
const filterRoomAvailabiy = async (roomType, roomId, bedSetup) => {
    const roomAvail = await prisma.room.findMany({
        where: {
            AND: [
                roomType ? { roomType: roomType } : {},
                roomId ? { id: parseInt(roomId) } : {},
                bedSetup ? { bedSetup: bedSetup } : {},
            ]
        }
    });

    return roomAvail;
}

module.exports = { getLogAvailabilityData, createNewLogAvailable, filterRoomAvailabiy, }