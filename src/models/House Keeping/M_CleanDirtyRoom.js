const { ThrowError, PrismaDisconnect } = require('../../utils/helper')
const { prisma } = require('../../../prisma/seeder/config')

/**
 * @typedef {object} GetAllRoomOption
 * @property {number} page
 * @property {number} show
 * @property {string} query
 * @property {string} sort
 * @property {'asc'|'desc'} order
 */

/**
 * @typedef {object} GetAllRoomResult
 * @property {number} total
 * @property {import('@prisma/client').Room[]} rooms
 */

const select = {
    id: true,
    roomStatus: {
        select: {
            longDescription: true,
        },
    },
    resvRooms: {
        select: {
            reservation: {
                select: {
                    reserver: {
                        select: {
                            guest_id: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    arrivalDate: true,
                    departureDate: true,
                },
            },
            roomMaids: {
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
    },
}

/**
 * @param {GetAllRoomOption} option
 * @throws {Error}
 * @return {Promise<GetAllRoomResult>}
 */
async function all(option) {
    try {
        const { page, show, sort, order, roomStatusId } = option
        const [total, rooms] = await prisma.$transaction([
            prisma.room.count({ where }),
            prisma.room.findMany({
                take: show,
                skip: (page - 1) * show,
                orderBy: {
                    [sort]: order,
                },
                where: { roomStatusId },
                select,
            }),
        ])
        return { rooms, total }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}

/**
 * @param {string} id
 * @param {number} roomStatusId
 * @param {number} userId
 * @throws {Error}
 * @return {Promise<import('@prisma/client').Room>}
 */
async function update(id, roomStatusId, userId) {
    try {
        const room = await prisma.room.update({
            where: { id: parseInt(id) },
            data: { roomStatusId },
            select,
        })
        const roomMaid = await prisma.roomMaid.update({
            where: { id: room.resvRooms.at(-1).roomMaids.at(-1).id },
            data: { userId }
        })
        return { room, roomMaid }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { all, update }