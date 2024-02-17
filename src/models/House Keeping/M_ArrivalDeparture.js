const { orderReservationByIdentifier } = require("../../models/Front Office/M_Reservation");
const { PrismaDisconnect, ThrowError, splitDateTime, generateDateBetweenStartAndEnd } = require("../../utils/helper");
const { prisma } = require("../../../prisma/seeder/config");

const searchGet = (q) => {
    try {
        const search = q
        return {
            idCard: {
                every: { cardId: { contains: search } }
            },
            id: { equals: parseInt(search) }
        }
    } catch (err) {
        ThrowError(err)
    }
}

const get = async (page = 1, perPage = 5, search = "", so, arr, dep) => {
    let arrival = { checkInToday: { room: 0, person: 0 }, arriving: { room: 0, person: 0 } }, departure = { departedToday: { room: 0, person: 0 }, departing: { room: 0, person: 0 } }, date;
    try {
        const dateNew = new Date();
        const currDate = dateNew.toISOString().split('T')[0];
        if (arr === undefined) arr = currDate
        if (dep === undefined) {
            dep = new Date(arr);
            dep.setDate(dep.getDate() + 7);
            dep = dep.toISOString().split('T')[0]
        }
        date = {
            arrivalDate: {
                gte: `${arr}T00:00:00.000Z`,
                lte: `${dep}T23:59:59.999Z`
            },
            departureDate: {
                gte: `${arr}T00:00:00.000Z`,
                lte: `${dep}T23:59:59.999Z`
            }
        }
        so = so ? orderReservationByIdentifier(so) : so
        if (search != "") search = searchGet(search)
        const [total, reservations] = await prisma.$transaction([
            prisma.resvRoom.count({
                where: {
                    deleted: false,
                    ...(so && so.whereQuery),
                    reservation: {
                        ...date,
                        ...(search != "" && search),
                    }
                },
            }),
            prisma.resvRoom.findMany({
                where: {
                    deleted: false,
                    ...(so && so.whereQuery),
                    reservation: {
                        ...date,
                        ...(search != "" && search),
                    }
                },
                select: {
                    reservation: {
                        select: {
                            id: true,
                            arrivalDate: true,
                            departureDate: true,
                            manyNight: true,
                            checkInDate: true,
                            checkoutDate: true,
                            manyAdult: true,
                            manyBaby: true,
                            manyChild: true,
                            reserver: {
                                select: {
                                    guest: {
                                        select: {
                                            name: true
                                        }
                                    },
                                    resourceName: true,
                                }
                            },
                            idCard: {
                                select: { cardId: true }
                            }
                        }
                    },
                    roomMaids: {
                        select: { user: { select: { name: true } } }
                    },
                    arrangmentCodeId: true,
                    room: {
                        select: {
                            id: true,
                            roomType: true,
                            roomStatus: {
                                select: {
                                    rowColor: true,
                                    textColor: true,
                                    shortDescription: true
                                }
                            }
                        }
                    },
                    created_at: true
                },
                skip: (page - 1) * perPage,
                take: + perPage,
                orderBy: so && so.orderQuery
            })
        ])
        let table = []
        reservations.forEach(res => {
            const nik = res.reservation.idCard.length != 1 ? '-' : res.reservation.idCard[0]
            const data = {
                resNo: res.reservation.id,
                resResource: res.reservation.reserver.resourceName,
                roomNo: {
                    id: res.room.id,
                    backgroundColor: res.room.roomStatus.rowColor,
                    textColor: res.room.roomStatus.textColor
                },
                roomType: res.room.roomType.id,
                bedType: res.room.roomType.bedSetup,
                guestName: res.reservation.reserver.guest.name,
                nik,
                arrangment: res.arrangmentCodeId,
                arrival: splitDateTime(res.reservation.arrivalDate).date,
                departure: splitDateTime(res.reservation.departureDate).date,
                night: res.reservation.manyNight,
                roomBoy: res.roomMaids,
                roomStatus: res.room.roomStatus,
                created: splitDateTime(res.created_at).date
            }
            table.push(data)
            if (res.reservation.checkInDate) {
                if (data.arrival === currDate) {
                    arrival.arriving.room++
                    arrival.arriving.person += res.reservation.manyAdult + res.reservation.manyBaby + res.reservation.manyChild
                }
                if (data.departure === currDate) {
                    departure.departing.room++
                    departure.departing.person += res.reservation.manyAdult + res.reservation.manyBaby + res.reservation.manyChild
                }
            }
            if (splitDateTime(res.reservation.checkInDate === currDate)) {
                arrival.checkInToday.room++
                arrival.checkInToday.person += res.reservation.manyAdult + res.reservation.manyBaby + res.reservation.manyChild
            }
            if (splitDateTime(res.reservation.checkoutDate === currDate)) {
                departure.departedToday.room++
                departure.departedToday.person += res.reservation.manyAdult + res.reservation.manyBaby + res.reservation.manyChild
            }
        })
        const lastPage = Math.ceil(total / perPage);
        return {
            arr, dep,
            arrival: {
                checkInToday: `${arrival.checkInToday.room}-${arrival.checkInToday.person}`,
                arriving: `${arrival.arriving.room}-${arrival.arriving.person}`,
                totalArrival: `${arrival.checkInToday.room + arrival.arriving.room}-${arrival.checkInToday.person + arrival.arriving.person}`
            },
            departure: {
                departedToday: `${departure.departedToday.room}-${departure.departedToday.person}`,
                departing: `${departure.departing.room}-${departure.departing.person}`,
                totalDeparture: `${departure.departedToday.room + departure.departing.room}-${departure.departedToday.person + departure.departing.person}`
            }, table, meta: {
                total,
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

module.exports = { get }