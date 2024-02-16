const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getAllRoom = async () => {
    try{
        return await prisma.room.findMany({ include:})
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}