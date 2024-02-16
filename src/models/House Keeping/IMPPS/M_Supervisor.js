const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../../utils/helper")
const { error } = require("../../../utils/response")
const task = require('./M_MaidTask')

const getSupervisorData = async (q) => {
    const { history = "false" } = q
    try {
        const tasks = await task.getAllToday({ ...(history === "false" && { finished: false })}, {
            room: {
                select: { id: true, roomType: true }
            },
            roomMaid: {
                select: { id: true, aliases: true, currentTask: true }
            },
            id: true,
            roomMaidId: true,
            schedule: true,
            request: true,
            rowColor: true,
            actual: true,
            comment: true,
            status: true,
            type: { select: { standardTime: true } }
        }, { rowColor: 'desc' }, 30, 1)

        const listTask = tasks.map((task) => {
            return {
                taskId: task.id,
                roomMaidId: task.roomMaidId,
                roomNo: task.room.id,
                roomType: task.room.roomType,
                schedule: task.schedule,
                rowColor: task.rowColor,
                standard: task.type.standardTime,
                actual: task.actual,
                remarks: task.request ? task.request : "-",
                pic: task.roomMaid.aliases,
                status: task.status ? task.status : "-",
                comments: task.comment ? task.comment : "-"
            };
        })
        const listStatus = await prisma.roomStatus.findMany({ select: { longDescription: true, shortDescription: true } })
        return { listTask, listStatus }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const isSupervisor = async (supervisorId) => {
    try {
        return await prisma.user.findFirstOrThrow({ where: { role: { name: "Supervisor" }, id: +supervisorId } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSupervisorData, isSupervisor }