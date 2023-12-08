const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

const getAllAvailableRoom = async () => {
    try{
        const availableRooms = await prisma.room.findMany({
            where: { occupied_status: false }, select: {
                id: true,
                roomType: true,
                bedSetup: true
            }
        });
        return availableRooms
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

module.exports = { getAllAvailableRoom }