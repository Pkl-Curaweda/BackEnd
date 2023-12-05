const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

const getAllAvailableRoom = async () => {
    const availableRooms = await prisma.room.findMany({ where: { occupied_status: false }, select: {
        id: true,
        roomType: true,
        bedSetup: true
    }});
    return availableRooms
}

module.exports = { getAllAvailableRoom }