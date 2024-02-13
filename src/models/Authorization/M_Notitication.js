const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, splitDateTime, countNotificationTime } = require("../../utils/helper")

const get = async (userData) => {
    try{
        console.log('masuk kah?')
        const dateRef = new Date()
        const currentDate = splitDateTime(dateRef).date
        const notifications = await prisma.notification.findMany({ where: {
            created_at: {  gte: userData.lastCheckNotif }
        }, select: { content: true, created_at: true }, orderBy: { created_at: 'desc' }, take: 5 })
        const listNotification = notifications.map(notif => ({
            content: notif.content,
            time: currentDate === splitDateTime(notif.created_at).date ? countNotificationTime(dateRef, notif.created_at) : splitDateTime(notif.created_at).date
        }))
        await prisma.user.update({ where: { id: userData.id } , data:{ lastCheckNotif: new Date().toISOString() }})
        return listNotification
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const getUnreadTotal = async (lastCheckTime) => {
    try{
        return await prisma.notification.count({ where: { created_at:{ gte: lastCheckTime } } })
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

module.exports = { get, createNotification, getUnreadTotal }