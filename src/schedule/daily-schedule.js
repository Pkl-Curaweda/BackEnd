const schedule = require('node-schedule')
const { prisma } = require('../../prisma/seeder/config')
const { isDateInRange, ThrowError, PrismaDisconnect } = require('../utils/helper')
const { addNewInvoiceFromArticle } = require('../models/Front Office/M_Invoice')

const permanentDeleteResvervation = async () => {
    try{
        const currDate = new Date().toISOString()
        await prisma
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect();
    }
}

const runSchedule = () => {
    const currDate = new Date().toISOString().split('T')[0]
    schedule.scheduleJob('daily', '* * * * *', async () => {
        await scheduleInvoiceReservation(currDate)
    })
}

// module.exports = { scheduleInvoiceReservation }