const { date } = require("zod");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd, isDateInRange, reverseObject } = require("../../utils/helper");

const formatFilter = (filter) => {
    let whereQuery
    try {
        const [ident, type] = filter.split('_')
        switch (ident) {
            case "T":
                whereQuery = { roomType: { longDesc: { contains: type } } }
                break;
            case "B":
                whereQuery = { roomType: { bedSetup: type } }
                break;
            default:
                break;
        }
        return whereQuery
    } catch (err) {
        ThrowError(err)
    }
}

const getLogAvailabilityData = async (dateQuery, page, perPage, filter, search) => {
    try {
        let logData = [], startDate, endDate, dates, roomAverage = {}, roomsList = [], rawRoomHistory = {}, roomHeaders = [], sortingType = []
        if (dateQuery === undefined) {
            const dateNew = new Date();
            startDate = dateNew.toISOString().split('T')[0]
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate = endDate.toISOString().split('T')[0]
        } else[startDate, endDate] = dateQuery.split(' ')
        const rooms = await prisma.room.findMany({ where: { deleted: false, NOT: { id: 0 } }, select: { id: true, roomType: true } })
        let index = 1
        let sortTypes = {}
        for (let room of rooms) {
            roomAverage[`total_${room.id}`] = 0
            roomsList.push(room.id)
            roomHeaders.push({
                name: `${room.id}-${room.roomType.id}-${room.roomType.bedSetup}`, label: `${room.id}-${room.roomType.id}-${room.roomType.bedSetup}`, field: `room_${index}`, align: "left"
            })
            sortTypes[room.roomType.id] = { id: `T_${room.roomType.longDesc}`, label: room.roomType.longDesc }
            rawRoomHistory[`room_${room.id}`] = { data: '', style: {} }
            index++
        }
        sortingType = Object.values(sortTypes)
        sortingType.push(
            {
                id: `R_ASC`,
                label: `${rooms[0].id} - ${rooms[rooms.length - 1].id}`
            },
            {
                id: `R_DESC`,
                label: `${rooms[rooms.length - 1].id} - ${rooms[0].id}`
            },
            {
                id: `B_KING`,
                label: "King Bed"
            },
            {
                id: `T_TWIN`,
                label: "Twin Bed"
            },
            {
                id: `T_SINGLE`,
                label: "Single Bed"
            }
        )
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

        let listShown = roomsList
        if (filter != undefined) {
            const whereQuery = formatFilter(filter)
            if (whereQuery != undefined) {
                const listRoomShown = []
                const filterRoom = (await prisma.room.findMany({ where: { ...whereQuery }, select: { id: true } }))
                for (let room of filterRoom) listRoomShown.push(room.id)
                listShown = listRoomShown
            }
        }
        dates = generateDateBetweenStartAndEnd(startDate, endDate)
        for (let date of dates) {
            let rmHist = { ...rawRoomHistory }
            let data = reservation.filter(rsv => {
                let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
                return isDateInRange(new Date(date), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
            })
            if (filter != undefined) {
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
                if (filter === "R_DESC") {
                    rmHist = reverseObject(rmHist)
                }
            }
            logData.push({
                date, rmHist
            })
        }
        // console.log(logData[0])
        Object.keys(roomAverage).forEach(avgKey => {
            avgKey.replace('total_', '');
            roomAverage[avgKey] = {
                data: { label: roomAverage[avgKey] > 0 ? `${parseInt(roomAverage[avgKey] / (dates.length * 100) * 100)}%` : "0%" },
                style: {}
            }
        });
        if (filter === "R_DESC"){
            roomAverage = reverseObject(roomAverage)
            roomHeaders.reverse()
        } 
        roomHeaders.unshift({ name: 'Date', label: 'Date', field: "Date", align: "left" })
        const lastPage = Math.ceil(dates.length / perPage);
    console.log(roomHeaders)
        return {
            roomHeaders, sortingType,
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