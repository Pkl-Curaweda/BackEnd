const schedule = require('node-schedule')
const { prisma } = require('../../prisma/seeder/config')
const { isDateInRange, ThrowError, PrismaDisconnect } = require('../utils/helper')
const { addNewInvoiceFromArticle } = require('../models/Front Office/M_Invoice')
const { genearateListOfTask } = require('../models/House Keeping/IMPPS/M_MaidTask')

 function runSchedule () {
    schedule.scheduleJob('generateTask', '0 6 * * *', async () => { //? GENERATE DAILY CLEAN
        console.log('IMPPS Running......')
        console.log('Generating Task....')
        await genearateListOfTask("DLYCLEAN").then(() => { console.log('Task Successfully Created') })
    })
    
    schedule.scheduleJob('invoiceValidator', '0 0 * * *', async () => { //? CHECKING EVERY RESERVATION INVOICE
        console.log('IMPPS Running......')
        console.log('Validating Invoice.......')
        const currentDate = new Date().toISOString()
        const resvRooms = await prisma.resvRoom.findMany({ where: { reservation: { arrivalDate: { gte: currentDate } } }, select: { id: true, reservation: { select: { id: true } } }})
        for(let res of resvRooms) await addNewInvoiceFromArticle([], res.reservation.id, res.id)
    })
}

module.exports = { runSchedule }
