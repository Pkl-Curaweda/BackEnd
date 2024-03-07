const qr = require("qrcode");
const fs = require("fs");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateRandomString, generateExpire } = require("../../utils/helper");
const { generateQRToken } = require("../Authorization/M_Token");
const { encrypt } = require("../../utils/encryption");
const { createOooRoom } = require("./M_OOORoom");

const getAllAvailableRoom = async () => {
    try {
        const availableRooms = await prisma.room.findMany({
            where: { occupied_status: false, deleted: false, NOT: [{ id: 0 }] }, select: {
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
        const rooms = await prisma.room.findMany({ where: { deleted: false }, select: { id: true, roomStatus: { select: { id: true, shortDescription: true, longDescription: true } } } })
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

const changeRoomStatusByDescription = async (roomId = 0, shortDescription, userId) => {
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

const getExpireCookieRoom = async (email) => {
    try{
        const userExist = await prisma.user.findFirstOrThrow({ where: { email }, select: { guestId: true } })
        if(!userExist.guestId) return
        const reservation = await prisma.reservation.findFirst({ where: { reserver: { guestId: userExist.guestId }}, select: { departureDate: true } })
        return reservation.departureDate
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const generateQrRoom = async (email, password) => {
    try {
        const storedData = { email, password }
        const path = `${process.env.QR_PATH}/QR-${email}.png`
        if (!fs.existsSync(path)) {
            const stringfyData = JSON.stringify(storedData);
            const encryptedData = encrypt(stringfyData);
            const storedQR = encryptedData;
            qr.toFile(path, storedQR, (err) => {
                if (err) console.log(err);
            });
        }
        return path
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getAllAvailableRoom, getRoomStatWithId, getAllRoomStatus, changeRoomStatusByDescription, changeOccupied, getExpireCookieRoom , generateQrRoom}