const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, splitDateTime, countNotificationTime } = require("../../utils/helper")

const get = async () => {
    try{
        const dateRef = new Date()
        const currentDate = splitDateTime(dateRef).date
        const notifications = await prisma.notification.findMany({ select: { content: true, created_at: true }, orderBy: { created_at: 'desc' }, take: 5 })
        const listNotification = notifications.map(notif => ({
            content: notif.content,
            time: currentDate === splitDateTime(notif.created_at).date ? countNotificationTime(dateRef, notif.created_at) : splitDateTime(notif.created_at).date
        }))
        // for(let notif of notifications){
        //     const [notifDate, notifTime] = splitDateTime(notif.created_at).date
        //     console.log(notifDate, notifTime)
        //     listNotification.push({
        //     })
        // }
        // const listNotification = notifications.map(notif => (
        //     {
        // }))
        return listNotification
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const createNotification = async (data = { content: '' }) => {
    try{
        const created = await prisma.notification.create({ data })
        return created
    }catch(err){
        ThrowError(err)
    }
}

module.exports = { get, createNotification }