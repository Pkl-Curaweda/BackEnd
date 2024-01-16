const { randomInt } = require("crypto")
const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const assignRoomMaid = async (resvRoomId) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: { id: 3 } },
            select: { id: true }
        })

        const user = users[randomInt(users.length)]
        const roomMaid = prisma.roomMaid.create({
            data: {
                userId: user.id,
                roomStatusId: 1,
                departmentId: 1,
                resvRoomId,
                no: "No?",
                done: false,
                from: new Date(),
                to: new Date(),
                note: "Dont leave the stain in the bed sheet"
            }
        })
        return roomMaid
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getRoomMaidReport = async () => {
    try {
        const [totalRoom, room] = await prisma.$transaction([
            prisma.room.count(),
            prisma.room.findMany({ select: { id: true, roomType: true, roomStatus: { select: { longDescription: true } } } })
        ])
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

/**
 * @typedef {object} GetAllRoomMaidOption
 * @property {number} page
 * @property {number} show
 * @property {string} query
 * @property {string} sort
 * @property {'asc'|'desc'} order
 * @property {Date} from
 * @property {Date} to
 */

/**
 * @typedef {object} GetAllRoomMaidResult
 * @property {number} total
 * @property {import('@prisma/client').User[]} users
 */

/**
 * @param {GetAllRoomMaidOption} option
 * @throws {Error}
 * @return {Promise<GetAllRoomMaidResult>}
 */
async function all(option) {
    const {
        page,
        show,
        query,
        sort,
        order,
        departure,
        arrival
    } = option

    const where = {
        AND: [
            {
                OR: [
                    { username: { contains: query } },
                    { email: { contains: query } },
                    { name: { contains: query } },
                ]
            },
            {
                birthday: {
                    gte: from,
                    lte: to,
                },
            },
            {
                roleId
            }
        ],
    }

    const [total, users] = await prisma.$transaction([
        prisma.roomMaid.count({ where }),
        prisma.roomMaid.findMany({
            take: show,
            skip: (page - 1) * show,
            where: {
                resvRoom: {
                    reservation: {
                        departureDate: {
                            lte: departure
                        },
                        arrivalDate: {
                            gte: arrival
                        }
                    }
                }
            },
            orderBy: {
                [sort]: order,
            },
            select
        })
    ])

    return { users, total }
}

/**
 * @param {string} id
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function get(id) {
    return await prisma.user.findUniqueOrThrow({
        where: {
            id: parseInt(id)
        },
        select
    })
}

/**
 * @param {import('@prisma/client').User} user
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function create(user) {
    return await prisma.user.create({
        data: user,
        select
    })
}

/**
 * @param {string} id
 * @param {import('@prisma/client').User} user
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function update(id, user) {
    return await prisma.user.update({
        where: {
            id: parseInt(id)
        },
        data: user,
        select
    })
}

/**
 * @param {string} id
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function remove(id) {
    return await prisma.user.delete({
        where: {
            id: parseInt(id)
        },
        select
    })
}


module.exports = { assignRoomMaid, all, get, create, update, remove }