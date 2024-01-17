const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd } = require("../../utils/helper");

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
        let logData = [], startDate, endDate, dates, averages = {};
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
            let roomHistory = logAvailability ? logAvailability.roomHistory : 0;
            if (filter != undefined && roomHistory != 0) roomHistory = filterRoomHistory(roomHistory, filter)
            if (search !== undefined && roomHistory !== 0) {
                const searchTerm = search.toLowerCase();
                roomHistory = Object.keys(roomHistory).reduce((filteredHistory, key) => {
                    const guestName = roomHistory[key].guestName;
                    if (guestName && guestName.toLowerCase().includes(searchTerm)) filteredHistory[key] = roomHistory[key];
                    return filteredHistory;
                }, {});
            }
            let rmHist = {
                room_1: {
                    data: '', style: {},
                },
                room_2: {
                    data: '', style: {},
                },
                room_3: {
                    data: '', style: {},
                },
                room_4: {
                    data: '', style: {},
                },
                room_5: {
                    data: '', style: {},
                },
                room_6: {
                    data: '', style: {},
                },
                room_7: {
                    data: '', style: {},
                },
                room_8: {
                    data: '', style: {},
                },
                room_9: {
                    data: '', style: {},
                },
                room_10: {
                    data: '', style: {},
                }
            }
            if (roomHistory != 0) {
                roomHistory = Object.values(roomHistory)
                for (rh of roomHistory) {
                    const key = `room_${rh.room.id}`;
                    rmHist[key] = {
                        data: rh.guestName || '',
                        style: rh.resvStatus ? { color: rh.resvStatus.textColor, backgroundColor: rh.resvStatus.rowColor } : {}
                    }
                }
            }

            if (roomHistory != 0) {
                Object.values(roomHistory).forEach(history => {
                    const key = `total_${history.room.id}`;
                    const averageKeyExists = averages.hasOwnProperty(key);
                    averages[key] = (averageKeyExists ? averages[key] : 0) + 1;
                })
            }
            console.log("---dsadadhaihdasudanji")
            const pushedData = {
                date: searchedDate.toISOString().split('T')[0],
                rmHist
            }
            console.log(pushedData)
            logData.push(pushedData);
        }
        let roomAverage = { total_1: 0, total_2: 0, total_3: 0, total_4: 0, total_5: 0, total_6: 0, total_7: 0, total_8: 0, total_9: 0, total_10: 0 }
        Object.keys(averages).forEach((average) => {
            const avg = averages[average];
            roomAverage[average] = avg / logData.length * 100;
        });
        console.log(roomAverage)
        const lastPage = Math.ceil(dates.length / perPage);
        return {
            logData,
            roomAverage,
            meta: {
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