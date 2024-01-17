const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")
const { getAllRoomStatus } = require("./M_Room")

const getRoomOccupancyData = async (q) => {
    const { page, perPage } = q
    const currentDate = new Date().toISOString()
    let currData = { occ: { room: 0, person: 0 }, comp: { room: 0, person: 0 }, houseUse: { room: 0, person: 0 }, estOcc: { room: 0, person: 0 }, ooo: { room: 0, person: 0 }, om: { room: 0, person: 0 } }
    try {
        const roomStatus = await getAllRoomStatus()
        for (let room of roomStatus) {
            const [r, estR] = await prisma.$transaction([
                prisma.resvRoom.findFirst({ where: { roomId: room.id, reservation: { checkInDate: { not: null } } }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } } }),
                prisma.resvRoom.findMany({ where: { roomId: room.id, reservation: { arrivalDate: { gte: currentDate } } }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } } })
            ])
            console.log(r, estR)
            switch (room.roomStatus.shortDescription) {
                case "OC" || "OD":
                    currData.occ.room++;
                    currData.occ.person = r ? +(r.reservation.manyAdult + r.reservation.manyBaby + r.reservation.manyChild) : + 0
                    break;
                case "OOO":
                    currData.ooo.room++;
                    break;
                case "OM":
                    currData.om.room++;
                    break;
                default:
                    break;
            }
            if (estR.length != 0) {
                currData.estOcc.room++
                const estPersom = 0
                for (let resv of estR) {
                    estPersom += (resv.reservation.manyAdult + resv.reservation.manyBaby + resv.reservation.manyChild)
                }
                currData.estOcc.person = + estPersom
            }
        }
        console.log(currData)
        return { currData }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getRoomOccupancyData }