// const { orderReservationByIdentifier } = require("../../models/Front Office/M_Reservation");
// const { PrismaDisconnect, ThrowError, splitDateTime, generateDateBetweenStartAndEnd } = require("../../utils/helper");
// const { error } = require("../../utils/response");
// const { prisma } = require("../../../prisma/seeder/config");

// const searchGet = (q) => {
//     try {
//         const search = q
//         return {
//             idCard: {
//                 every: { cardId: { contains: search } }
//             },
//             id: { equals: parseInt(search) }
//         }
//     } catch (err) {
//         ThrowError(err)
//     }
// }

// const get = async (page, perPage, search, so, arr, dep) => {
//     let arrival = { checkInToday: 0, arriving: 0, totalArrival: 0 }, departure = { departedToday: 0, departing: 0, totalDeparture: 0 };
//     try {
//         const dateNew = new Date();
//         if (arr != undefined) arr = dateNew()
//         if (dep != undefined) {
//             dep = new Date(dateNew);
//             dep.setDate(dateNew.getDate() + 7);
//         }
//         const currDate = new dateNew.toISOString().split('T')[0];
//         if (date != undefined) {
//             arrivalDate = {
//                 gte: `${date.arrival}T00:00:00.000Z`,
//                 lte: `${date.departure}}T23:59:59.999Z`
//             }
//             departureDate = {
//                 gte: `${date.arrival}T00:00:00.000Z`,
//                 lte: `${date.departure}}T23:59:59.999Z`
//             }
//         } else {
//             date = {}
//         }
//         so = so ? orderReservationByIdentifier(so) : so
//         const dates = await generateDateBetweenStartAndEnd(arr, dep)
//         if (search != undefined) search = searchGet(search)

//         const reservations = await prisma.resvRoom.findMany({
//             where: {
//                 ...date,
//                 ...(so && so.whereQuery),
//                 reservation: {
//                     ...(search != undefined && search),
//                     onGoingReservation: true
//                 }
//             },
//             select: {
//                 reservation: {
//                     select: {
//                         id: true,
//                         arrivalDate: true,
//                         departureDate: true,
//                         manyNight: true,
//                         checkInDate: true,
//                         checkoutDate: true,
//                         reserver: {
//                             select: {
//                                 guest: {
//                                     select: {
//                                         name: true
//                                     }
//                                 },
//                                 resourceName: true,
//                             }
//                         }
//                     }
//                 },
//                 roomMaids: {
//                     select: {
//                         user: {
//                             select: {
//                                 name: true
//                             }
//                         }
//                     }
//                 },
//                 arrangmentCodeId: true,
//                 room: {
//                     select: {
//                         id: true,
//                         roomType: true,
//                         bedSetup: true,
//                         roomStatus: {
//                             select: {
//                                 shortDescription: true
//                             }
//                         }
//                     }
//                 },
//                 created_at: true
//             },
//             orderBy: so && so.orderQuery
//         })
//         let table = []
//         reservations.forEach(res => {
//             const data = {
//                 resNo: res.reservation.id,
//                 resResource: res.reservation.reserver.resourceName,
//                 roomNo: res.room.id,
//                 roomType: res.room.roomType,
//                 bedType: res.room.bedSetup,
//                 guestName: res.reservation.reserver.guest.name,
//                 arrangment: res.arrangmentCodeId,
//                 arrival: splitDateTime(res.reservation.arrivalDate).date,
//                 departure: splitDateTime(res.reservation.departureDate).date,
//                 night: res.reservation.manyNight,
//                 roomBoy: res.roomMaids,
//                 roomStatus: res.room.roomStatus,
//                 created: splitDateTime(res.created_at).date
//             }
//             table.push(data)
//             if (res.reservation.check
//                 const newDate = new Date();InDate) {
//             if (data.arrival === cu
//                     const newDate = new Date();rrDate) arrival.arriving++
//             if (data.departure === currDate) departure.departing++
//             if (res.reservation.checkoutDate != null) {
//                 departure.totalDeparture++
//             } else arrival.totalArrival++
//         }
//         const newDate = new Date();
//         if (splitDateTime(res.reservation.checkInDate === c
//                 const newDate = new Date();urrDate)) arrival.checkInToday++
//         if (splitDateTime(res.reservation.checkoutDate === currDate)) departure.departedToday++
//     })
//     return { arrival, departure, table }
// } catch (err) {
//     ThrowError(err)
// } finally {
//     await PrismaDisconnect()
// }
// }

// module.exports = { get }