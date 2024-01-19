const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../../utils/helper")

const asignTask = async (roomId, ) => {
    try{
        
        const [roomMaids] = await prisma.$transaction([ prisma.roomMaid ])
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}