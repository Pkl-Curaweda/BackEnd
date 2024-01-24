const { date } = require("zod");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd, isDateInRange } = require("../../utils/helper");

const filterRoomHistory = (roomHistory, filter) => {
    let filteredRoomHistory = {};
    const filterIdentifier = filter.split("_")[0]
    filter = filter.split("_")[1]
    switch (filterIdentifier) {
        case "T":
            Object.values(roomHistory).forEach((room) => {
                if (room.room.roomType === filter) filteredRoomHistory[`room_${room.room.id}`] = room;
            });
            break;
        case "B":
            Object.values(roomHistory).forEach((room) => {
                if (room.room.bedSetup === filter) filteredRoomHistory[`room_${room.room.id}`] = room;
            });
            break;
        default:
            filteredRoomHistory = roomHistory
            break;
    }
    if (Object.keys(filteredRoomHistory).length === 0) filteredRoomHistory = 0
    return filteredRoomHistory
}

const getLogAvailabilityData = async (dateQuery, page, perPage, filter, search) => {
    try {
        let logData = [], startDate, endDate, dates, averages = { total_1: 0, total_2: 0, total_3: 0, total_4: 0, total_5: 0, total_6: 0, total_7: 0, total_8: 0, total_9: 0, total_10: 0 }, roomAverage = { total_1: 0, total_2: 0, total_3: 0, total_4: 0, total_5: 0, total_6: 0, total_7: 0, total_8: 0, total_9: 0, total_10: 0 }
        if (dateQuery === undefined) {
            const dateNew = new Date();
            startDate = dateNew.toISOString().split('T')[0]
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate = endDate.toISOString().split('T')[0]
        } else[startDate, endDate] = dateQuery.split(' ')

        const reservation = await prisma.resvRoom.findMany({
            where: {
                reservation: {
                    AND: [
                        {
                            arrivalDate: {
                                gte: `${startDate}T00:00:00.000Z`,
                            }
                        },
                        {
                            departureDate: {
                                lte: `${endDate}T23:59:59.999Z`
                            }
                        }
                    ]
                }
            },
            select: {
                id: true,
                arrangment: {
                    select: { rate: true }
                },
                room: {
                    select: { id: true, roomType: true, bedSetup: true }
                },
                reservation: {
                    select: {
                        id: true,
                        arrivalDate: true,
                        departureDate: true,
                        resvStatus: { select: { rowColor: true, textColor: true } },
                        reserver: { select: { guest: { select: { name: true } } } }
                    }
                }
            }
        })
        dates = generateDateBetweenStartAndEnd(startDate, endDate)
        for (let date of dates) {
            let rmHist = { room_1: { data: '', style: {}, }, room_2: { data: '', style: {} }, room_3: { data: '', style: {}, }, room_4: { data: '', style: {}, }, room_5: { data: '', style: {}, }, room_6: { data: '', style: {}, }, room_7: { data: '', style: {}, }, room_8: { data: '', style: {} }, room_9: { data: '', style: {}, }, room_10: { data: '', style: {}, } }
            const data = reservation.filter(rsv => {
                let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
                return isDateInRange(new Date(date), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
            })
            for (let dt of data) {
                const key = `room_${dt.room.id}`
                const avgKey = `total_${dt.room.id}`
                roomAverage[avgKey] += 100
                rmHist[key] = {
                    data: { label: dt.reservation.reserver.guest.name, resvId: dt.reservation.id, resvRoomId: dt.id },
                    style: { color: dt.reservation.resvStatus.textColor, backgroundColor: dt.reservation.resvStatus.rowColor }
                }
            }
            if (filter != undefined) rmHist = filterRoomHistory(rmHist, filter)
            if (search !== undefined) {
                const searchTerm = search.toLowerCase();
                rmHist = Object.keys(rmHist).reduce((filteredHistory, key) => {
                    const guestName = rmHist[key].data.label
                    if (guestName && guestName.toLowerCase().includes(searchTerm)) filteredHistory[key] = rmHist[key];
                    return filteredHistory;
                }, {});
            }
            logData.push({
                date, rmHist
            })
        }
        Object.keys(roomAverage).forEach(avgKey => {
            avgKey.replace('total_', '');
            roomAverage[avgKey] = roomAverage[avgKey] > 0 ? parseInt( roomAverage[avgKey] / (dates.length * 100) * 100 ) : 0;
        });
        
        const lastPage = Math.ceil(dates.length / perPage);
        return { logData, roomAverage,  meta: {
            total: dates.length,
            currPage: page,
            lastPage,
            perPage,
            prev: page > 1 ? page - 1 : null,
            next: page < lastPage ? page + 1 : null
        } }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}


const createNewLogAvailable = async () => {
    try {
        let roomHistory = {};
        const rooms = await prisma.room.findMany({ select: { id: true, roomType: true, bedSetup: true }, orderBy: { id: 'asc' } });
        for (const room of rooms) {
            const resvRoom = await prisma.resvRoom.findFirst({
                where: {
                    reservation: {
                        onGoingReservation: true
                    },
                    roomId: room.id
                },
                select: {
                    id: true,
                    arrangment: {
                        select: {
                            rate: true
                        }
                    },
                    reservation: {
                        select: {
                            id: true,
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
                    }, room: {
                        select: {
                            id: true,
                            roomType: true,
                            bedSetup: true
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
                    "reservationId": resvRoom.reservation.id,
                    "resvRoomId": resvRoom.id,
                    "guestName": resvRoom.reservation.reserver.guest.name,
                    "resvStatus": resvRoom.reservation.resvStatus,
                    "room": resvRoom.room,
                    "occupied": 1,
                };
            } else {
                roomHistory[key] = {
                    "room": {
                        "id": room.id,
                        "roomType": room.roomType,
                        "bedSetup": room.bedSetup
                    },
                    "occupied": 0,
                };
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