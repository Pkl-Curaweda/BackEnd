const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getRoomOccupancyData = async () => {
    try{
        c
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}