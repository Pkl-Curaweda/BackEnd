const { startOfWeekYear } = require("date-fns");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

const getAllAvailableRoom = async () => {
    try {
        const availableRooms = await prisma.room.findMany({
            where: { occupied_status: false, deleted: false, NOT:[ { id: 0 }] }, select: {
                id: true,
                roomType: true
            }
        });
        return availableRooms
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const getAllRoomStatus = async () => {
    try {
        const rooms = await prisma.room.findMany({ where: { deleted: false },select: { id: true, roomStatus: { select: { id: true, shortDescription: true, longDescription: true } } } })
        return rooms
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getRoomStatWithId = async (id) => {
    let room, allStat;
    try {
        if (id) room = await prisma.room.findFirstOrThrow({ where: { id: parseInt(id), deleted: false }, select: { roomStatus: true } })
        allStat = await prisma.roomStatus.findMany()
        return { room, allStat }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const changeRoomStatusByDescription = async (roomId = 0, shortDescription) => {
    try {
        const roomStatusExist = await prisma.roomStatus.findFirstOrThrow({ where: { shortDescription }, select: { id: true, shortDescription: true } })
        await prisma.room.findFirstOrThrow({ where: { id: roomId, deleted: false } })
        return await prisma.room.update({ where: { id: roomId }, data: { roomStatus: { connect: { id: roomStatusExist.id } } }, include: { roomStatus: { select: { shortDescription: true, longDescription: true } } } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const changeOccupied = async (roomId, value) => {
    try {
        return await prisma.room.update({ where: { id: roomId, deleted: false }, data: { occupied_status: value } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getAllAvailableRoom, getRoomStatWithId, getAllRoomStatus, changeRoomStatusByDescription, changeOccupied }