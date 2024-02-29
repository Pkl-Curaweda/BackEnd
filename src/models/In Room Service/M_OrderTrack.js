const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getDefault = async (orderTrackId) => {
    try{
        return await prisma.orderTrack.findFirstOrThrow({ where: { id: +orderTrackId }, select: {  } })
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { getDefault }