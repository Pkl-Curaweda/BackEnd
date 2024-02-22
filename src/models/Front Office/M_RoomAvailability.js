const { date } = require("zod");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd, isDateInRange, reverseObject } = require("../../utils/helper");

const filterRoomHistory = (roomHistory, filter) => {
    let filteredRoomHistory = [];
    const filterIdentifier = filter.split("_")[0]
    filter = filter.split("_")[1]
    switch (filterIdentifier) {
        case "T":
            for (room of roomHistory) {
                if (room.room.roomType.id === filter) filteredRoomHistory.push(room);
            }
            break;
        case "B":
            for (room of roomHistory) if (room.room.roomType.bedSetup === filter) filteredRoomHistory.push(room);
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
        let logData = [], startDate, endDate, dates, roomAverage = { }, roomsList = [], rawRoomHistory = []
        if (dateQuery === undefined) {
            const dateNew = new Date();
            startDate = dateNew.toISOString().split('T')[0]
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate = endDate.toISOString().split('T')[0]
        } else[startDate, endDate] = dateQuery.split(' ')
        const rooms = await prisma.room.findMany({ where: { deleted: false }, select: { id: true, roomType: true } })
        for (let room of rooms) {
            roomAverage[`total_${room.id}`] = 0
            roomsList.push(room.id)
            rawRoomHistory[`room_${room.id}`] = { data: '', style: {} }
        }
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
                },
                deleted: false
            },
            select: {
                id: true,
                arrangment: {
                    select: { rate: true }
                },
                room: {
                    select: { id: true, roomType: true }
                },
                reservation: {
                    select: {
                        id: true,
                        arrivalDate: true,
                        departureDate: true,
                        borderColor: true,
                        reserver: { select: { guest: { select: { name: true } } } }
                    }
                }
            }
        })
        dates = generateDateBetweenStartAndEnd(startDate, endDate)
        let listShown = roomsList
        for (let date of dates) {
            let rmHist = rawRoomHistory
            let data = reservation.filter(rsv => {
                let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
                return isDateInRange(new Date(date), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
            })
            if (filter != undefined) {
                const type = filter.split('_')[1]
                switch (type) {
                    case "STANDARD":
                    case "SINGLE":
                        listShown = [108, 109, 110];
                        break;
                    case "DELUXE":
                    case "KING":
                        listShown = [101, 102, 103, 104];
                        break;
                    case "FAMILY":
                    case "TWIN":
                        listShown = [105, 106, 107];
                        break;
                }
                for (let roomId in rmHist) {
                    if (!listShown.includes(parseInt(roomId.split('_')[1]))) {
                        rmHist[roomId].style = { backgroundColor: '#dddddd', opacity: '50%' };
                    }
                }
            }
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
                    if (listShown.includes(dt.room.id)) {
                        rmHist[key] = {
                            data: { label: dt.reservation.reserver.guest.name, resvId: dt.reservation.id, resvRoomId: dt.id },
                            style: { color: "#000000", backgroundColor: dt.reservation.borderColor }
                        }
                    } else {
                        rmHist[key] = {
                            data: { label: dt.reservation.reserver.guest.name, resvId: dt.reservation.id, resvRoomId: dt.id },
                            style: { backgroundColor: '#dddddd  ', color: '#000000', opacity: '50%' }
                        }
                    }
                }
                if (filter === "R_DESC") rmHist = reverseObject(rmHist)
                console.log(rmHist)
            }
            logData.push({
                date, rmHist
            })
        }
        console.log(logData)
        Object.keys(roomAverage).forEach(avgKey => {
            console.log(avgKey)
            avgKey.replace('total_', '');
            roomAverage[avgKey] = {
                data: { label: roomAverage[avgKey] > 0 ? `${parseInt(roomAverage[avgKey] / (dates.length * 100) * 100)}%` : "0%" },
                style: {}
            }
        });
        if (filter === "R_DESC") roomAverage = reverseObject(roomAverage)
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
        const rooms = await prisma.room.findMany({ where: { deleted: false }, select: { id: true, roomType: true, bedSetup: true }, orderBy: { id: 'asc' } });
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
                        "roomType": room.roomType.id,
                        "bedSetup": room.roomType.bedSetup
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