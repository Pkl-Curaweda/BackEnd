const schedule = require('node-schedule')
const { prisma } = require('../../prisma/seeder/config')
const { isDateInRange, ThrowError, PrismaDisconnect } = require('../utils/helper')
const { addNewInvoiceFromArticle } = require('../models/Front Office/M_Invoice')

const permanentDeleteResvervation = async () => {
    try{
        const currDate = new Date().toISOString()
        const resvRoomList = await prisma.resvRoom.findMany({ where: { deleted_at: { lte: currDate } }})
        if(resvRoomList.length > 0){
            for(let resvRoom of resvRoomList) await prisma.resvRoom.delete({ where: { id: resvRoom.id } })
        }
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect();
    }
}
schedule.scheduleJob('daily', '0 * * * *', async () => { //?Every one minute check deleted_at
    console.log('DELETING......')
    await permanentDeleteResvervation()
})