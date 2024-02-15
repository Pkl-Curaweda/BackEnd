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

const getAllRoomStatus = async () => {
    try{
        const rooms = await prisma.room.findMany({ select: { id: true, roomStatus: { select: { id: true, shortDescription: true, longDescription: true } } } })
        return rooms
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
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

const changeRoomStatusByDescription = async (roomId = 0, shortDescription) => {
    try{
        const roomStatusExist = await prisma.roomStatus.findFirstOrThrow({where: { shortDescription }, select: { id: true, shortDescription: true } })
        await prisma.room.findFirstOrThrow({ where: { id: roomId }})
        return await prisma.room.update({ where: {  id: roomId}, data: { roomStatus: { connect: { id: roomStatusExist.id } }}, include: { roomStatus: { select: { shortDescription: true, longDescription: true } } } })
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const changeOccupied = async (roomId, value) => {
    try{
        return await prisma.room.update({ where: { id: roomId }, data: { occupied_status: value } })
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { getAllAvailableRoom, getRoomStatWithId, getAllRoomStatus, changeRoomStatusByDescription, changeOccupied}