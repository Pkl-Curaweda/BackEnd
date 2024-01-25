const { date } = require("zod");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd, isDateInRange, reverseObject } = require("../../utils/helper");

const filterRoomHistory = (roomHistory, filter) => {
    let filteredRoomHistory = [];
    const filterIdentifier = filter.split("_")[0]
    filter = filter.split("_")[1]
    switch (filterIdentifier) {
        case "T":
            for (room of roomHistory) if (room.room.roomType === filter) filteredRoomHistory.push(room);
            break;
        case "B":
            for (room of roomHistory) if (room.room.bedSetup === filter) filteredRoomHistory.push(room);
            break;
        default:
            filteredRoomHistory = roomHistory
            break;
    }
    if (Object.keys(filteredRoomHistory).length === 0) filteredRoomHistory = []
    return filteredRoomHistory
}

const getLogAvailabilityData = async (dateQuery, page, perPage, filter, search) => {
    try {
        let logData = [], startDate, endDate, dates, roomAverage = { total_1: 0, total_2: 0, total_3: 0, total_4: 0, total_5: 0, total_6: 0, total_7: 0, total_8: 0, total_9: 0, total_10: 0 }
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
                    OR: [
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
                    ],
                    onGoingReservation: true
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
            let rmHist = { room_101: { data: '', style: {}, }, room_102: { data: '', style: {} }, room_103: { data: '', style: {}, }, room_104: { data: '', style: {}, }, room_105: { data: '', style: {}, }, room_106: { data: '', style: {}, }, room_107: { data: '', style: {}, }, room_108: { data: '', style: {} }, room_109: { data: '', style: {}, }, room_110: { data: '', style: {}, } }
            let data = reservation.filter(rsv => {
                let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
                return isDateInRange(new Date(date), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
            })
            if (filter != undefined) data = filterRoomHistory(data, filter)
            if (search !== undefined) {
                const searchTerm = search.toLowerCase();
                data = Object.keys(data).reduce((filteredHistory, key) => {
                    const guestName = data[key].reservation.reserver.guest.name
                    if (guestName && guestName.toLowerCase().includes(searchTerm)) filteredHistory[key] = data[key];
                    return filteredHistory;
                }, {});
                data = Object.values(data)
            }
            if (data.length > 0) {
                for (let dt of data) {
                    const key = `room_${dt.room.id}`
                    const avgKey = `total_${dt.room.id}`
                    roomAverage[avgKey] += 100
                    rmHist[key] = {
                        data: { label: dt.reservation.reserver.guest.name, resvId: dt.reservation.id, resvRoomId: dt.id },
                        style: { color: dt.reservation.resvStatus.textColor, backgroundColor: dt.reservation.resvStatus.rowColor }
                    }
                }
                if (filter === "R_DESC") rmHist = reverseObject(rmHist)
            }
            logData.push({
                date, rmHist
            })
        }
        Object.keys(roomAverage).forEach(avgKey => {
            avgKey.replace('total_', '');
            roomAverage[avgKey] = roomAverage[avgKey] > 0 ? parseInt(roomAverage[avgKey] / (dates.length * 100) * 100) : 0;
        });

        const lastPage = Math.ceil(dates.length / perPage);
        return {
            logData, roomAverage, meta: {
                total: dates.length,
                currPage: page,
                lastPage,
                perPage,
                prev: page > 1 ? page - 1 : null,
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