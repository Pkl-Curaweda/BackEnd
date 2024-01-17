const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")
const { getAllRoomStatus } = require("./M_Room")

const getRoomOccupancyData = async (q) => {
    const { page, perPage } = q
    const currentData = new Date().toISOString().split('T')[0]
    let currData = { occ: { room: 0, person: 0 }, comp: { room: 0, person: 0 }, houseUse: { room: 0, person: 0 }, estOcc: { room: 0, person: 0 }, ooo: { room: 0, person: 0 }, om: { room: 0, person: 0 } }
    try {
        const roomStatus = await getAllRoomStatus()
        for (let room of roomStatus) {
            const r = await prisma.resvRoom.findFirst({ where: { roomId: room.id }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } } })
            switch (room.roomStatus.shortDescription) {
                case "OC" || "OD":
                    currData.occ.room++;
                    currData.occ.person = +(r.reservation.manyAdult, r.reservation.manyBaby, r.reservation.manyChild)
                    return
                case "OOO":
                    currData.ooo.room++;
                    return
                case "OM":
                    currData.om.room++;
                    return
                default:
                    break;
            }
            if (r) {
            }
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}