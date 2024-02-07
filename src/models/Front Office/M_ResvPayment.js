const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, countDPP, countTax, splitDateTime, countTaxAndTotalInvoice } = require("../../utils/helper")

const getBillingSummary = async (id, reservationId) => {
    try {
        let arrivalDate, departureDate;
        let resvRoom = await prisma.resvRoom.findFirstOrThrow({
            where: { id, reservationId },
            select: {
                id: true,
                arrangment: {
                    select: {
                        rate: true
                    }
                },
                roomId: true,
                voucherId: true,
                reservation: {
                    select: {
                        arrivalDate: true, departureDate: true,
                        reserver: {
                            select: { resourceName: true, guest: { select: { id: true, name: true, contact: true } } }
                        }
                    }
                }
            }
        })
        const guest = resvRoom.reservation.reserver.guest
        arrivalDate = resvRoom.reservation.arrivalDate.toISOString().split("T")[0];
        departureDate = resvRoom.reservation.departureDate.toISOString().split("T")[0];
        const dates = generateDateBetweenStartAndEnd(arrivalDate, departureDate)

        const invoices = await prisma.invoice.findMany({
            where: { paid: false },
            select: { id: true, created_at: true, articleType: { select: { id: true, description: true, price: true } }, qty: true, roomId: true, rate: true, orderDetail: { select: { id: true, service: { select: { id: true, name: true, price: true } } } } },
            orderBy: { rate: 'asc' }
        })

        const billList = invoices.map(inv => ({
            art: inv.articleType != null ? inv.articleType.id : "In Room",
            uniqueId: inv.id,
            qty: inv.qty,
            desc: inv.articleType != null ? inv.articleType.description : inv.orderDetail.service.name,
            rate: inv.rate,
            amount: (inv.rate * inv.qty),
            roomNo: inv.roomId,
            billDate: splitDateTime(inv.created_at).date,
        }))

        const { tax, total } = countTaxAndTotalInvoice(billList)
        let add = {
            billNumber: `${reservationId}-${resvRoom.id}`,
            reservationResource: resvRoom.reservation.resourceName,
            arrivalDate, departureDate,
            guestName: `${guest.name} - ${guest.contact}`
        }
        return {
            add,
            invoices: billList,
            tax,
            total
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

//TODO: 
const paidInvoice = async (invoiceId) => {
    try {
        const alreadyPaid = await prisma.invoice.findFirstOrThrow({ where: { id: invoiceId }, select: { paid: true } })
        if (alreadyPaid.paid != true) {
            return await prisma.invoice.update({ where: { id: invoiceId }, data: { paid: true } })
        } else return false
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const createResvPayment = async (reservationId, resvRoomId, data) => {
    let paidArticle = [], totalBill = 0, totalTax = 0, { invoices, paidAmount, paymentMethod, useTax } = data
    try {
        await prisma.resvRoom.findFirstOrThrow({ where: { reservationId, id: resvRoomId } });
        for (let dt of invoices) {
            totalBill += dt.amount
            if (useTax != false) totalTax += (dt.amount * 21) / 100
            paidAmount -= (totalBill + totalTax)

            //? Check if the amount of paid are enought to paid invoice
            //?if not then finish the for loop and only pay invoice that can be paid
            if (paidAmount < 0) break
            const invoice = await paidInvoice(dt.uniqueId)
            if (invoice != false) paidArticle.push(invoice)
        }
        if (paidArticle.length < 1) throw Error('You didnt pay for anything sorry')
        const resvPay = await prisma.resvPayment.create({
            data: {
                resvRoomId,
                paymentMethod,
                orders: { details: paidArticle },
                total: totalBill,
                tax: totalTax
            }
        })
        return { changes: paidAmount, resvPay }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}


module.exports = { getBillingSummary, createResvPayment }