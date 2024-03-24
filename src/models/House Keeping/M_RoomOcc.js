const { object } = require("zod")
const { prisma } = require("../../../prisma/seeder/config")
const { search } = require("../../routes/R_Login")
const { ThrowError, PrismaDisconnect, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd, splitDateTime } = require("../../utils/helper")
const { getAllRoomStatus } = require("./M_Room")

const getRoomOccupancyData = async (q) => {
    const { page, perPage, disOpt, filt } = q
    const currentDate = new Date()
    let currData = { occ: { room: 0, person: 0 }, comp: { room: 0, person: 0 }, houseUse: { room: 0, person: 0 }, ooo: { room: 0, person: 0 }, om: { room: 0, person: 0 }, estOcc: { room: 0, person: 0 } }, percData = {}
    try {
        //TODO: HOUSE USE, COMP
        const listOfTypes = (await prisma.roomType.findMany({ where: { deleted: false, NOT: { id: 'REMOVED' } }, select: { id: true, longDesc: true } })).map(types => ({ id: types.id, label: `${types.longDesc} Room` }))
        const roomType = filt && filt != "ALL" ? { roomType: { id: filt } } : undefined
        const roomStatus = await prisma.room.findMany({
            where: {
                NOT: { id: 0 },
                deleted: false,
                ...(roomType != undefined && roomType)
            }, select: {
                id: true,
                roomType: true,
                roomStatus: {
                    select: { shortDescription: true, longDescription: true }
                }
            }
        })
        for (let room of roomStatus) {
            const [r, estR] = await prisma.$transaction([
                prisma.resvRoom.findFirst({
                    where: {
                        roomId: room.id, reservation: {
                            checkInDate: { not: null }, onGoingReservation: true
                        },
                        deleted: false
                    }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } }
                }),
                prisma.resvRoom.findMany({
                    where: {
                        roomId: room.id, reservation: {
                            arrivalDate: { gte: `${splitDateTime(currentDate.toISOString()).date}T00:00:00.000Z` }
                        },
                        deleted: false
                    }, select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } }
                })
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
                case "HU":
                    currData.houseUse.room++
                default:
                    break;
            }
            if (estR.length != 0) {
                currData.estOcc.room++
                let estPerson = 0
                for (let resv of estR) estPerson += resv.reservation.manyAdult + resv.reservation.manyBaby + resv.reservation.manyChild
                currData.estOcc.person += estPerson
            }
        }
        percData = { ...currData }
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
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDate);
                break
            case "year":
                [startDate, endDate] = [`${currentYear}-01-01T00:00:00.000Z`, `${currentYear}-12-31T23:59:59.999Z`]
                break;
            default:
                [startDate, endDate] = [`${currentDate.toISOString().split('T')[0]}T00:00:00.000Z`, `${currentDate.toISOString().split('T')[0]}T23:59:59.999Z`]
                break;
        }
        const notDate = {
            not: {
                gte: `${splitDateTime(currentDate.toISOString()).date}T00:00:00.000Z`,
                lte: `${splitDateTime(currentDate.toISOString()).date}T23:59:59.999Z`
            }
        }
        const [r, comp, hu, ooo, om] = await prisma.$transaction([
            prisma.resvRoom.findMany({
                where: {
                    reservation: {
                        AND: [
                            { arrivalDate: { gte: startDate, ...notDate } },
                            { departureDate: { lte: endDate, ...notDate } }
                        ]
                    }
                },
                select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } }
            }),
            prisma.resvRoom.findMany({
                where: {
                    voucher: { trackComp: true },
                    created_at: { ...notDate }
                },
                select: { reservation: { select: { manyAdult: true, manyBaby: true, manyChild: true } } }
            }),
            prisma.oooOmRoom.count({ //TODO: MAYBE, PERSON IN HOUSE USE NEED TO BE CHANGED, FOR NOW IT ONLY TAKE THE STORED DATA FROM OOO OM ROOM MODEL
                where: {
                    xType: "HU",
                    created_at: { ...notDate }
                }
            }),
            prisma.oooOmRoom.count({
                where: {
                    xType: "OOO",
                    created_at: { ...notDate }
                }
            }),
            prisma.oooOmRoom.count({
                where: {
                    xType: "OM",
                    created_at: { ...notDate }
                }
            })
        ])

        let estPers = 0, compPerson = 0
        for (let resv of r) estPers += resv.reservation.manyAdult + resv.reservation.manyBaby + resv.reservation.manyChild
        percData.estOcc.person += estPers
        for (let com of comp) compPerson += com.reservation.manyAdult + com.reservation.manyBaby + com.reservation.manyChild
        percData.comp.person += compPerson
        percData.comp.room += comp.length
        percData.houseUse.room += hu
        percData.ooo.room += ooo
        percData.om.room += om
        let roomPerc = [], personPerc = [], graph = { room: 0, person: 0 }
        Object.values(percData).forEach((data, ind) => {
            roomPerc[ind] = data.room
            personPerc[ind] = data.person
            graph.room += data.room
            graph.person += data.person
        })
        listOfTypes.push({ id: 'ALL', label: "ALL" })
        return { listOfTypes, currData, percData: { roomPerc, personPerc, graph }, roomStatus }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getRoomOccupancyData }