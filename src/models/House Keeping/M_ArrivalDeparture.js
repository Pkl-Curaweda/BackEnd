const { orderReservationByIdentifier } = require("../../models/Front Office/M_Reservation");
const { PrismaDisconnect, ThrowError, splitDateTime, generateDateBetweenStartAndEnd } = require("../../utils/helper");
const { error } = require("../../utils/response");
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

const get = async (page, perPage, search, so, arr, dep) => {
    let arrival = { checkInToday: 0, arriving: 0, totalArrival: 0 }, departure = { departedToday: 0, departing: 0, totalDeparture: 0 }, date = {};
    try {
        const dateNew = new Date();
        const currDate = dateNew.toISOString().split('T')[0];
        if (arr != undefined || dep != undefined) {
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
        }
        so = so ? orderReservationByIdentifier(so) : so
        if (search != undefined) search = searchGet(search)
        const reservations = await prisma.resvRoom.findMany({
            where: {
                ...(so && so.whereQuery),
                reservation: {
                    ...date,
                    ...(search != undefined && search),
                    onGoingReservation: true
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
                        reserver: {
                            select: {
                                guest: {
                                    select: {
                                        name: true
                                    }
                                },
                                resourceName: true,
                            }
                        }
                    }
                },
                roomMaids: {
                    select: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                arrangmentCodeId: true,
                room: {
                    select: {
                        id: true,
                        roomType: true,
                        bedSetup: true,
                        roomStatus: {
                            select: {
                                shortDescription: true
                            }
                        }
                    }
                },
                created_at: true
            },
            orderBy: so && so.orderQuery
        })
        let table = []
        reservations.forEach(res => {
            const data = {
                resNo: res.reservation.id,
                resResource: res.reservation.reserver.resourceName,
                roomNo: res.room.id,
                roomType: res.room.roomType,
                bedType: res.room.bedSetup,
                guestName: res.reservation.reserver.guest.name,
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
                if (data.arrival === currDate) arrival.arriving++
                if (data.departure === currDate) departure.departing++
                if (res.reservation.checkoutDate != null) {
                    departure.totalDeparture++
                } else arrival.totalArrival++
            }
            if (splitDateTime(res.reservation.checkInDate === currDate)) arrival.checkInToday++
            if (splitDateTime(res.reservation.checkoutDate === currDate)) departure.departedToday++
        })
        return { arr, dep, arrival, departure, table }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { get }