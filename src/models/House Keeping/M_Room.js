const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

const getAllAvailableRoom = async () => {
    try {
        const availableRooms = await prisma.room.findMany({
            where: { occupied_status: false }, select: {
                id: true,
                roomType: true,
                bedSetup: true
            }
        });
        return availableRooms
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const getRoomStatWithId = async (id) => {
    let room, allStat;
    try {
        if (id) room =  await prisma.room.findFirstOrThrow({ where: { id: parseInt(id) }, select: { roomStatus: true } })
        allStat = await prisma.roomStatus.findMany()
        return { room, allStat }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const postStatusChange = async (payload) => {
    try {
        const { id, roomStatusId } = payload
        const chgStat = await prisma.room.update({ where: { id: parseInt(id) }, data: { roomStatusId: parseInt(roomStatusId) } })
        return { roomId: chgStat.id, statusId: chgStat.roomStatusId }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getAllAvailableRoom, getRoomStatWithId, postStatusChange }