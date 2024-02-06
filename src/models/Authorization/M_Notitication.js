const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, splitDateTime } = require("../../utils/helper")

const get = async () => {
    try{
        const notifications = await prisma.notification.findMany({ select: { content: true, created_at: true }, orderBy: { created_at: 'desc' }, take: 5 })
        const listNotification = notifications.map(notif => ({
            content: notif.content,
            time: splitDateTime(notif.created_at).date
        }))
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