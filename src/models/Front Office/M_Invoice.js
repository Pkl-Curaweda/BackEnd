const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, countNight, generateDateBetweenStartAndEnd } = require("../../utils/helper")

//?This one is only the invoice is by the room/ per resvRoom
const GetInvoiceByResvRoomId = async (reservationId, resvRoomId, sortIdentifier, page, perPage) => {
    try {
        let invoices = [], startIndex, endIndex, arrivalDate, departureDate;
        let resvRoom = await prisma.resvRoom.findFirstOrThrow({
            where: { id: resvRoomId, reservationId },
            select: {
                arrangment: {
                    select: {
                        rate: true
                    }
                },
                roomId: true,
                voucherNo: true,
                roomMaids: {
                    select: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                reservation: {
                    select: {
                        arrivalDate: true, departureDate: true,
                        reserver: {
                            select: { guestId: true }
                        }
                    }
                }
            }
        })
        const { guestId } = resvRoom.reservation.reserver
        arrivalDate = resvRoom.reservation.arrivalDate.toISOString().split("T")[0];
        departureDate = resvRoom.reservation.departureDate.toISOString().split("T")[0];
        const dates = generateDateBetweenStartAndEnd(arrivalDate, departureDate)
        startIndex = Math.max(0, (page - 1) * perPage);
        endIndex = Math.min(dates.length - 1, startIndex + perPage - 1);

        for (let i = startIndex; i <= endIndex; i++) {
            const searchedDate = new Date(dates[i]);
            const searchDate = searchedDate.toISOString().split("T")[0];
            //?ROOM PRICE / DAYS
            invoices.push({
                art: 115,
                qty: 1,
                desc: "Room",
                rate: resvRoom.arrangment.rate,
                amount: resvRoom.arrangment.rate,
                billDate: searchDate
            })

            const orders = await prisma.orderDetail.findMany({
                where: {
                    order: { guestId },
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
                    art: order.id,
                    qty: order.qty,
                    desc: order.service.name,
                    rate: order.service.price,
                    amount: order.qty * order.service.price,
                    billDate: searchDate
                })
            })

            const payments = await prisma.resvPayment.findMany({
                where: {
                    created_at: {
                        gte: `${searchDate}T00:00:00.000Z`,
                        lte: `${searchDate}T23:59:59.999Z`
                    }
                },
                select: {
                    orders: true,
                    total: true
                }
            })

            payments.forEach((payment) => {
                //?ANY PAYMENT IN THIS DATE
                invoices.push({
                    art: 111,
                    qty: 1,
                    desc: "Payment",
                    rate: payment.total,
                    amount: 1 * payment.total,
                    billDate: searchDate
                })
            })
        }
        if(sortIdentifier != undefined) invoices = sortInvoiceData(invoices, sortIdentifier)

        // const 
        const lastPage = Math.ceil(dates.length / perPage);
        return {
            invoices,
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

const sortInvoiceData = (invoice, sortIdentifier) => {
    let propertiesKey;
    propertiesKey = sortIdentifier.split("-")[0]
    if(propertiesKey === 'rev') propertiesKey = 'amount'
    const sortBy = sortIdentifier.split("-")[1]
    if(propertiesKey === 'desc' || propertiesKey === 'date'){
        switch (sortBy) {
            case "desc":
                invoice = invoice.sort((a, b) => b[propertiesKey]?.localeCompare(a[propertiesKey]));
                break;
            default:
                invoice = invoice.sort((a, b) => a[propertiesKey]?.localeCompare(b[propertiesKey]));
                break;
        }
    }else{
        switch (sortBy) {
            case "desc":
                invoice = invoice.sort((a, b) => b[propertiesKey] - a[propertiesKey]);
                break;
            default:
                invoice = invoice.sort((a, b) => a[propertiesKey] - b[propertiesKey]);
                break;
        }
    }
    return invoice
}

module.exports = { GetInvoiceByResvRoomId }