const { ThrowError, PrismaDisconnect } = require("../../utils/helper");
const { prisma } = require("../../../prisma/seeder/config")

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
    let { roomPage = 1, roomPerPage = 5, taskPage = 1, taskPerPage = 1, roomSortOrder } = q
    try {
        roomSortOrder = sortingStatusPage(roomSortOrder)
        const [listStatus, roomTotal, roomStatus, latestChange, taskTotal, taskData] = await prisma.$transaction([
            prisma.roomStatus.findMany({ select: { id: true, longDescription: true } }),
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
                take: roomPerPage,
                orderBy: { ...roomSortOrder }
            }),
            prisma.room.findFirst({ select: { id: true, roomStatus: { select: { longDescription: true } } }, orderBy: { updatedAt: 'desc' } }),
            prisma.maidTask.count(),
            prisma.maidTask.findMany({ select: { roomId: true, request: true, roomMaid: { select: { user: { select: { name: true } } } }, mainStatus: true }, take: taskPerPage, skip: (taskPage - 1) * taskPerPage })
        ])
        const roomLastPage = Math.ceil(roomTotal / roomPerPage);
        const taskLastPage = Math.ceil(taskTotal / taskPerPage)
        return {
            roomStatus, listStatus, roomMeta: {
                total: roomTotal,
                currPage: roomPage,
                lastPage: roomLastPage,
                perPage: roomPerPage,
                prev: roomPage > 1 ? roomPage - 1 : null,
                next: roomPage < roomLastPage ? roomPage + 1 : null
            }, latestChange, taskData, taskMeta: {
                total: taskTotal,
                currPage: taskPage,
                lastPage: taskLastPage,
                perPage: taskPerPage,
                prev: taskPage > 1 ? taskPage - 1 : null,
                next: taskPage < taskLastPage ? taskPage + 1 : null
            }
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getStatusData }