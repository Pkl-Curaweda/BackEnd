const { randomInt } = require("crypto")
const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, splitDateTime, generatePercentageValues, getTimeDifferenceInMinutes, getMaidPerfomance } = require("../../../utils/helper")
const { getTime } = require("date-fns")

const getAllRoomMaid = async () => {
    try {
        const roomMaids = await prisma.roomMaid.findMany({
            select: {
                id: true,
                aliases: true,
                workload: true,
                urgentTask: true,
                currentTask: true,
                user: { select: { name: true } }
            }
        })
        return roomMaids
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const assignRoomMaid = async (resvRoomId) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: { id: 3 }, deleted: false },
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


const getRoomMaidTaskById = async (id, q) => {
    const { page = 1, perPage = 30, history = "false" } = q
    try {
        const currDate = new Date().toISOString().split('T')[0]
        const roomMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id }, select: { id: true, urgentTask: true, currentTask: true, user: { select: { name: true } } } })
        const maidTask = await prisma.maidTask.findMany({
            where: {
                roomMaidId: id, AND: [
                    { created_at: { gte: `${currDate}T00:00:00.000Z` } },
                    { created_at: { lte: `${currDate}T23:59:59.999Z` } }
                ],
                ...(history === "false" && { finished: false })
            }, select: {
                room: {
                    select: { id: true, roomType: true }
                },
                id: true,
                schedule: true,
                request: true,
                rowColor: true,
                comment: true,
                UoM: true,
                actual: true,
                status: true,
                type: { select: { standardTime: true, UoM: true } }
            }, orderBy: { rowColor: 'asc' }, take: +perPage, skip: (page - 1) * perPage
        })

        const maidPerfomance = await convertPerfomance(roomMaid.id)
        const listTask = maidTask.map(mTask => {
            return {
                taskId: mTask.id,
                roomNo: mTask.room.id,
                roomType: mTask.room.roomType,
                schedule: mTask.schedule,
                rowColor: `#${mTask.rowColor}`,
                standard: `${mTask.customWorkload ? mTask.customWorkload : mTask.type.standardTime} ${mTask.type.UoM}`,
                actual: mTask.actual != null ? `${mTask.actual} ${mTask.UoM}` : '',
                remarks: mTask.request ? mTask.request : "-",
                status: mTask.status ? mTask.status : "-",
                comments: mTask.comment ? mTask.comment : "-"
            };
        })
        return { maidName: roomMaid.user.name, performance: maidPerfomance, listTask }
    } catch (err) {
        ThrowError(err)
    } finally {
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
            prisma.room.findMany({ where: { deleted: false },select: { id: true, roomType: true, roomStatus: { select: { longDescription: true } } }, orderBy: { ...roomOrderBy } })
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
            let pic = ''
            if (r) {
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

const isRoomMaid = async (userId) => {
    try {
        return await prisma.roomMaid.findFirstOrThrow({ where: { userId } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const countActual = async (startTime, endTime) => {
    let actual = 0, UoM = "Minute"
    try {
        actual = getTimeDifferenceInMinutes(startTime, endTime)
        if (actual > 60) {
            UoM = "Hour"
            actual = parseInt(actual / 60)
        }
        return { actual, UoM }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const countTaskPerformance = async (taskId, spvPerformance) => {
    try {
        const task = await prisma.maidTask.findFirstOrThrow({ where: { id: taskId }, select: { endTime: true, startTime: true, type: { select: { standardTime: true } } } })
        const minutes = getTimeDifferenceInMinutes(task.startTime, task.endTime)
        const maidPerfomance = getMaidPerfomance(minutes, task.type.standardTime)
        return parseInt((spvPerformance + maidPerfomance) / 2)
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const convertPerfomance = async (roomMaidId) => {
    try {
        const roomMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: roomMaidId } })
        return roomMaid.finishedTask != 0 ? parseInt(roomMaid.rawPerfomance / roomMaid.finishedTask) : 5
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const resetRoomMaid = async () => {
    try {
        const roomMaids = await prisma.roomMaid.findMany({ select: { id: true, shift: { select: { startTime: true } } } })
        for (let rm of roomMaids) {
            await prisma.roomMaid.update({
                where: { id: rm.id },
                data: { workload: 0 }
            })
        }
        return "Success"
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const createRoomMaid = async (b) => {
    try {
        await prisma.user.findFirstOrThrow({ where: { id: b.userId, deleted: false } })
        return await prisma.roomMaid.create({ data: { ...b } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { resetRoomMaid, getAllRoomMaid, convertPerfomance, assignRoomMaid, countTaskPerformance, getRoomMaidReport, getRoomMaidTaskById, countActual, isRoomMaid, createRoomMaid }