const schedule = require('node-schedule')
const { prisma } = require('../../prisma/seeder/config')
const { isDateInRange } = require('../utils/helper')
const { addNewInvoiceFromArticle } = require('../models/Front Office/M_Invoice')

// const scheduleInvoiceReservation = async (date) => {
//     const resv = await prisma.resvRoom.findMany({ where: { reservation: { onGoingReservation:true } }, select: { id: true, reservation: { select: { arrivalDate: true, departureDate: true } }, arrangment: { select: { rate: true } } } })
//     const rsv = resv.filter(rsv => {
//         let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
//         return isDateInRange(new Date(date), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
//     })
//     for (let r of rsv) {
//         console.log(r)
//         await prisma.invoice.create({ data: { resvRoomId: r.id, articleTypeId: 998, qty: 1, rate: r.arrangment.rate, dateUsed: new Date(date), dateReturn: new Date(date) } })
//     }
// }


// const runSchedule = () => {
//     const currDate = new Date().toISOString().split('T')[0]
//     schedule.scheduleJob('daily', '0 0 * * *', async () => {
//         await scheduleInvoiceReservation(currDate)
//     })
// }

// module.exports = { scheduleInvoiceReservation }