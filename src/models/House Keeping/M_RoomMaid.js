const { randomInt } = require("crypto")
const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, splitDateTime } = require("../../utils/helper")

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

const getRoomMaidTaskById = async (id) => {
    try{
        const currDate = new Date().toISOString().split('T')[0]
        const [roomMaid] = await prisma.$transaction([
            prisma.roomMaid.findFirstOrThrow({ where: { id }, select:{ user: { select: { name: true, role: { select: { name: true } } } } } }),
            prisma.maidTask.findMany({ where: { roomMaidId: id, created_at: { gte: `${currDate}T00:00:00.000Z` } }, select: {
                room: {
                    select: { id: true, roomType: true }
                },
                
            } })
        ]) 
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const getRoomMaidReport = async (q) => {
    let { page = 1, perPage = 5, arr, dep, sortOrder } = q
    try {
        if (arr === undefined) arr = new Date().toISOString().split('T')[0]
        if (dep === undefined) {
            dep = new Date(arr);
            dep.setDate(dep.getDate() + 7);
            dep = dep.toISOString().split('T')[0]
        }
        const roomOrderBy = sortOrder === "roomType" ? { roomType: 'asc' } : { id: 'asc' }
        const [total, rooms] = await prisma.$transaction([
            prisma.room.count(),
            prisma.room.findMany({ select: { id: true, roomType: true, roomStatus: { select: { longDescription: true } } }, orderBy: { ...roomOrderBy } })
        ])
        const reports = []
        let startIndex = (page - 1) * perPage;
        let endIndex = startIndex + perPage - 1;
        startIndex = Math.max(0, startIndex);
        endIndex = Math.min(rooms.length - 1, endIndex);

        for (let room of rooms) {
            const r = await prisma.resvRoom.findFirst({
                where: {
                    roomId: room.id, reservation: {
                        AND: [
                            {
                                arrivalDate: { gte: `${arr}T00:00:00.000Z` },
                            },
                            {
                                departureDate: { lte: `${dep}T23:59:59.999Z` }
                            }
                        ]
                    }
                },
                select: {
                    room: { select: { RoomMaid: { select: { aliases: true }, orderBy: { priority: 'asc' }, take: 1 } } },
                    reservation: { select: { id: true, arrivalDate: true, departureDate: true, reservationRemarks: true, reserver: { select: { guest: { select: { name: true } } } } } }
                },
                orderBy: { updated_at: 'desc' }
            })
            let pic  = ''
            if(r){
                const roomMaid = r.room.RoomMaid
                pic = roomMaid.length != 0 ? roomMaid[0].aliases : ''
            }
            reports.push({
                roomNo: room.id,
                roomType: room.roomType,
                roomStatus: room.roomStatus.longDescription,
                pic,
                guestName: r ? r.reservation.reserver.guest.name : '',
                resNo: r ? r.reservation.id : '',
                arrival: r ? splitDateTime(r.reservation.arrivalDate).date : '',
                departure: r ? splitDateTime(r.reservation.departureDate).date : '',
                remarks: r ? r.reservation.reservationRemarks : ''
            })
            console.log(reports)
        }
        if (sortOrder != undefined) {
            switch (sortOrder) {
                case "reservationNumber":
                    reports.sort((a, b) => a.resNo - b.resNo);
                    break;
                case "guestName":
                    reports.sort((a, b) => a.guestName.localeCompare(b.guestName));
                    break;
                default:
                    break;
            }
        }

        const report = reports.slice(startIndex, endIndex + 1);

        const lastPage = Math.ceil(total / perPage)
        return {
            report, meta: {
                total,
                currPage: +page,
                lastPage,
                perPage,
                prev: page > 1 ? page - 1 : null,
                next: page < lastPage ? page + 1 : null
            }
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const resetRoomMaid = async () => {
    try{
        const roomMaids = await prisma.roomMaid.findMany({ select: { id: true, shift: { select: { startTime: true } } } })
        for(let rm of roomMaids){
            await prisma.roomMaid.update({
                where: { id: rm.id },
                data:{
                    workload: 0,
                    currentSchedule: rm.shift.startTime
                }
            })
        }
        return "Success"
    }catch(err){
        ThrowError(err)
    }finally{
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


module.exports = { resetRoomMaid, assignRoomMaid, all, get, create, update, remove, getRoomMaidReport }