const { prisma } = require("../../../prisma/seeder/config")
const { search } = require("../../routes/R_Login")
const { ThrowError, PrismaDisconnect, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd } = require("../../utils/helper")
const { getAllRoomStatus } = require("./M_Room")

const getRoomOccupancyData = async (q) => {
    const { page, perPage, disOpt, filt } = q
    const currentDate = new Date()
    let currData = { occ: { room: 0, person: 0 }, comp: { room: 0, person: 0 }, houseUse: { room: 0, person: 0 }, estOcc: { room: 0, person: 0 }, ooo: { room: 0, person: 0 }, om: { room: 0, person: 0 } }, percData = {}
    try {
        //TODO: GRAPH ROOM OCCUPANCY
        const roomType = filt ? { roomType: filt } : undefined
        const roomStatus = await prisma.room.findMany({
            where: {
                ...(roomType != undefined && roomType)
            },select: {
                id: true,
                roomType: true,
                roomStatus: {
                    select: { longDescription: true }
                }
            }
        })
        for (let room of roomStatus) {
            const [r, estR] = await prisma.$transaction([
                prisma.resvRoom.findFirst({ where: { roomId: room.id, reservation: { checkInDate: { not: null }, onGoingReservation: true } }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } } }),
                prisma.resvRoom.findMany({ where: { roomId: room.id, reservation: { arrivalDate: { gte: currentDate.toISOString() } } }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } } })
            ])
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

            percData = { ...currData }
        }
        let startDate, endDate
        const currentYear = currentDate.getFullYear()
        //?PERCENTAGES
        switch (disOpt) {
            case "week":
                startDate = currentDate.toISOString()
                endDate = new Date(currentDate)
                endDate.setDate(currentDate.getDate() - 6)
                endDate = endDate.toISOString()
                break
            case "month":
                startDate = new Date(currentDate.setDate(currentDate.getDate() - (currentDate.getDate() - 1)))
                lastDate = new Date(currentDate.getFullYear, currentDate.getMonth() + 1, 0).getDate()
                endDate = new Date(currentDate.setDate(lastDate))
                break
            case "year":
                [startDate, endDate] = [`${currentYear}-01-01T00:00:00.000Z`, `${currentYear}-12-31T23:59:59.999Z`]
                break;
            default:
                [startDate, endDate] = [`${currentDate.toISOString().split('T')[0]}T00:00:00.000Z`, `${currentDate.toISOString().split('T')[0]}T23:59:59.999Z`]
                break;
        }
        const [r, ooo] = await prisma.$transaction([
            prisma.resvRoom.findMany({ where: { reservation: { arrivalDate: { gte: startDate, lte: endDate, not: currentDate.toISOString() }, departureDate: { gte: startDate, lte: endDate, not: currentDate.toISOString() } } }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } } }),
            prisma.oooRoom.count({ where: { created_at: { not: currentDate.toISOString() } } })
        ])
        let estPers = 0
        for (let resv of r) estPers += (resv.reservation.manyAdult + resv.reservation.manyBaby + resv.reservation.manyChild)
        currData.estOcc.person = + estPers
        percData.ooo.room += ooo
        return { currData, percData, roomStatus }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getRoomOccupancyData }