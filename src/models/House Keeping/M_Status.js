const { ThrowError, PrismaDisconnect } = require("../../utils/helper");
const { prisma } = require("../../../prisma/seeder/config");
const { getAllToday } = require("./IMPPS/M_MaidTask");

const sortingStatusPage = (q) => {
    let orderBy;
    try {
        switch (q) {
            case "roomType":
                orderBy = { roomType: 'asc' }
                break;
            case "bedType":
                orderBy = { bedSetup: 'asc' }
                break;
            case "status":
                orderBy = { roomStatus: { shortDescription: 'asc' } }
                break;
            default:
                orderBy = { id: 'asc' }
                break;
        }
        return orderBy
    } catch (err) {
        ThrowError(err)
    }
}

const getStatusData = async (q) => {
    let { roomPage = 1, roomPerPage = 10, roomSortOrder } = q
    try {
        roomSortOrder = sortingStatusPage(roomSortOrder)
        const [roomTotal, roomStatus, latestChange] = await prisma.$transaction([
            prisma.room.count(),
            prisma.room.findMany({
                select: {
                    id: true,
                    roomType: true,
                    bedSetup: true,
                    roomStatus: {
                        select: { longDescription: true }
                    }
                },
                skip: (roomPage - 1) * roomPerPage,
                take: +roomPerPage,
                orderBy: { ...roomSortOrder }
            }),
            prisma.room.findFirst({ select: { id: true, roomStatus: { select: { longDescription: true } } }, orderBy: { updatedAt: 'desc' } }),
        ])
        const roomLastPage = Math.ceil(roomTotal / roomPerPage);
        return {
            roomStatus, latestChange, roomMeta: {
                total: roomTotal,
                currPage: roomPage,
                lastPage: roomLastPage,
                perPage: roomPerPage,
                prev: roomPage > 1 ? roomPage - 1 : null,
                next: roomPage < roomLastPage ? roomPage + 1 : null
            }
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const refreshTask = async (q) => {
    const { page = 1, perPage = 5 } = q
    const currDate = new Date().toISOString().split('T')[0]
    try {
        const where = {
            AND: [
                { created_at: { gte: `${currDate}T00:00:00.000Z` } },
                { created_at: { lte: `${currDate}T23:59:59.999Z` } }
            ]
        }
        const [total, listTask] = await prisma.$transaction([
            prisma.maidTask.count({ where: { ...where } }),
            prisma.maidTask.findMany({ where: { ...where },
                select: {
                    roomId: true,
                    request: true,
                    roomMaid: { select: { aliases: true } },
                    mainStatus: true
                }, take: +perPage, skip: (+page - 1) * perPage
            })
        ])
        const lastPage = Math.ceil(total / perPage);
        return {
            listTask, meta: {
                total,
                currPage: +page,
                lastPage,
                perPage,
                prev: page > 1 ? page - 1 : null,
                next: page < lastPage ? +page + 1 : null
            }
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getStatusData, refreshTask }