const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")
const { getAllRoomStatus } = require("./M_Room")

const getRoomOccupancyData = async (q) => {
    const { page, perPage } = q
    try{
        const roomStatus = await getAllRoomStatus()
        
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}