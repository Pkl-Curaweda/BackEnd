const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const get = async () => {
    try{
        const notifications = await prisma.notification.findMany({ select: { content: true, created_at: true }, orderBy: { created_at: 'desc' }, take: 5 })
        return notifications
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const create = async (data) => {
    try{
        const created = await prisma.notification.create({ data })
        return created
    }catch(err){
        ThrowError(err)
    }
}

module.exports = { get, create }