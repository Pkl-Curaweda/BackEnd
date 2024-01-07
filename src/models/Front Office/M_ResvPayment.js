const { tr } = require("@faker-js/faker");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, countDPP } = require("../../utils/helper")

const getBillingSummary = async (id, reservationId) => {
    try{
        let invoices = [], arrivalDate, departureDate;
        let resvRoom = await prisma.resvRoom.findFirstOrThrow({
            where: { id, reservationId },
            select: {
                arrangment: {
                    select: {
                        rate: true
                    }
                },
                roomId: true,
                voucherNo: true,
                reservation: {
                    select: {
                        arrivalDate: true, departureDate: true,
                        reserver: {
                            select: { resourceName: true, guest: { select: { id: true, name: true } } }
                        }
                    }
                }
            }
        })
        const guest = resvRoom.reservation.reserver.guest
        arrivalDate = resvRoom.reservation.arrivalDate.toISOString().split("T")[0];
        departureDate = resvRoom.reservation.departureDate.toISOString().split("T")[0];
        const dates = generateDateBetweenStartAndEnd(arrivalDate, departureDate)

        for (date of dates) {
            const searchedDate = date
            const searchDate = searchedDate.toString().split("T")[0];
            //?ROOM PRICE / DAYS
            invoices.push({
                art: 998,
                uniqueId: 1,
                qty: 1,
                desc: "Room",
                rate: resvRoom.arrangment.rate,
                amount: resvRoom.arrangment.rate,
                billDate: searchDate
            })

            const orders = await prisma.orderDetail.findMany({
                where: {
                    order: { guestId: guest.id },
                    created_at: {
                        gte: `${searchDate}T00:00:00.000Z`,
                        lte: `${searchDate}T23:59:59.999Z`
                    }
                },
                select: {
                    id: true,
                    qty: true,
                    service: {
                        select: {
                            id: true,
                            name: true,
                            price: true
                        }
                    }
                }
            })

            orders.forEach((order) => {
                //?ORDER / DAYS
                invoices.push({
                    art: order.service.id,
                    uniqueId: order.id,
                    qty: order.qty,
                    desc: order.service.name,
                    rate: order.service.price,
                    amount: order.qty * order.service.price,
                    billDate: searchDate
                })
            })
        }
        const dpp = countDPP(invoices)
        let add = {
            billNumber: `${reservationId}-${resvRoom.voucherNo}`,
            reservationResource: resvRoom.reservation.resourceName,
            arrivalDate, departureDate,
            guestName: guest.name
        }
        return {
            add,
            invoices,
            dpp
        }
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { getBillingSummary }