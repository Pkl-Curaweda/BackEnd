const { ThrowError, PrismaDisconnect, splitDateTime } = require('../../utils/helper')
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

const sortOrderCleanDirty = (ident, ascDesc) => {
    let roomOrder;
    try {
        if (ascDesc !== "asc" && ascDesc !== "desc") throw "Please use the correct order"
        switch (ident) {
            case 'roomId':
                roomOrder = { id: ascDesc }
                break;
            case 'roomType':
                roomOrder = { roomType: ascDesc }
                break;
            default:
                throw 'No Order Matched'
        }
        return roomOrder
    } catch (err) {
        ThrowError(err)
    }
}
const getCleanDirtyData = async (sortOrder, arrival, departure) => {
    let room = [], main = { VCU: 0, VC: 0, VD: 0, OC: 0, OD: 0, ED: 0, DnD: 0, OO: 0, OF: 0 }, ident, ascDesc, roomOrder = undefined;
    try {
        if (sortOrder != undefined) [ident, ascDesc] = sortOrder.split(' ');
        if (sortOrder != undefined && ident === 'roomId' || sortOrder != undefined && ident === 'roomType') {
            sortOrder = sortOrderCleanDirty(sortOrder)
            roomOrder = sortOrder
        }
        const rs = await prisma.room.findMany({ select: { id: true, roomStatus: { select: { shortDescription: true, longDescription: true } } }, orderBy: roomOrder ? roomOrder : { id: 'asc' } });
        rs.forEach(async r => {
            const resv = await prisma.resvRoom.findFirst({ where: { roomId: r.id }, select: { roomId: true, roomMaids: { select: { user: { select: { name: true } } } }, reservation: { select: { id: true, arrivalDate: true, departureDate: true, reserver: { select: { guest: { select: { name: true } } } } } } }, orderBy: { created_at: 'desc' } })
            if (resv != null) {
                room.push({
                    roomNo: r.id,
                    roomStatus: r.roomStatus.longDescription,
                    guestName: resv.reservation.reserver.guest.name,
                    arrival: splitDateTime(resv.reservation.arrivalDate).date,
                    departure: splitDateTime(resv.reservation.departureDate).date,
                    pic: resv.roomMaids
                })
            }
            const status = r.roomStatus.shortDescription;
            if (main.hasOwnProperty(status)) {
                main[status]++;
            }
        });
        switch (ident) {
            case 'guestName':
                room.sort((a, b) => a.guestName.localeCompare(b.guestName));
                break;
            case 'pic':
                room.sort((a, b) => a.pic.user.name.localeCompare(b.pic.user.name));
                break;
            default:
                break;
        }
        return { room, main }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

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

module.exports = { all, update, getCleanDirtyData }