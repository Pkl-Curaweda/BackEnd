const { accessSync } = require("fs")
const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, splitDateTime, isRoomAvailable } = require("../../../utils/helper")
const { error } = require("../../../utils/response")
const task = require('./M_MaidTask')
const { isRoomMaid } = require("./M_RoomMaid")
const { send } = require("process")
const { getAllAvailableRoom } = require("../M_Room")

const getSupervisorData = async (q) => {
    const { history = "false" } = q
    try {
        const tasks = await task.getAllToday({ ...(history === "false" && { finished: false }) }, {
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
            UoM: true,
            rowColor: true,
            customWorkload: true,
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
                standard: `${task.customWorkload ? task.customWorkload : task.type.standardTime} ${task.UoM}`,
                actual: `${task.actual || 0} ${task.UoM}`,
                remarks: task.request ? task.request : "-",
                pic: task.roomMaid.aliases,
                status: task.status ? task.status : "-",
                comments: task.comment ? task.comment : "-"
            };
        })
        const listRoom = await prisma.room.findMany({ where: { NOT: [{ id: 0 }] ,deleted: false}, select: { id: true } })
        const listStatus = await prisma.roomStatus.findMany({ select: { longDescription: true, shortDescription: true } })
        return { listTask, listStatus, listRoom }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const helperAddTask = async (query) => {
    let { roomNo, roomBoy } = query, sendedData = { list: { room: undefined, maid: undefined }, choosenRoom: undefined, choosenMaid: undefined }, maids
    try {
        if (roomNo === "0" && roomBoy === "0") {
            [sendedData.list.room, maids] = await prisma.$transaction([
                prisma.room.findMany({ where: { NOT: [{ id: 0 }], deleted: false }, select: { id: true }, orderBy: { id: 'asc' } }),
                prisma.roomMaid.findMany({ where: { workload: { lt: 480 } }, select: { id: true, aliases: true, shiftId: true } })
            ])
            sendedData.list.maid = maids.map(maid => ({
                value: maid.id,
                label: `${maid.aliases} - Shift ${maid.shiftId}`
            }))
        }
        if (roomNo != "0") {
            const room = await prisma.room.findFirstOrThrow({
                where: { id: +roomNo }, select: {
                    id: true, roomImage: true, resvRooms: {
                        where: {
                            NOT: [{ deleted: true }],
                            reservation: {
                                AND: [
                                    { checkoutDate: null },
                                    { checkInDate: { lte: new Date().toISOString() } }
                                ]
                            }
                        }, take: 1
                    }, roomType: { select: { id: true, longDesc: true } }
                }
            })
            sendedData.choosenRoom = {
                id: room.id,
                image: room.roomImage,
                type: room.roomTypeId,
                workload: room.resvRooms.length < 1 ? (await prisma.taskType.findFirstOrThrow({ where: { id: `CLN` } })).standardTime : (await prisma.taskType.findFirstOrThrow({ where: { id: `FCLN-${room.roomType.longDesc}` } })).standardTime
            }
        }

        if (roomBoy != "0") {
            const roomMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: +roomBoy }, select: { aliases: true, shiftId: true, id: true, workload: true, user: { select: { picture: true } } } })
            sendedData.choosenMaid = {
                id: roomMaid.id,
                image: roomMaid.user.picture,
                aliases: roomMaid.aliases,
                shift: roomMaid.shiftId,
                workload: roomMaid.workload,
            }
        }
        return sendedData
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const helperChangeStatus = async () => {
    try{
        return await getAllAvailableRoom()
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const helperUnavailableRoomBoy = async (query) => {
    let sendedData = { listRoomBoy: undefined, unAvailableData: undefined, assigneData: undefined }, { unavail, assigne } = query
    const currentDate = splitDateTime(new Date().toISOString()).date
    try {
        if (unavail === "0" && assigne === "0") {
            const roomMaids = await prisma.roomMaid.findMany({ select: { id: true, user: { select: { name: true } } } })
            sendedData.listRoomBoy = roomMaids.map((maid) => ({
                id: maid.id,
                name: maid.user.name
            }))
        }
        if (unavail != "0") {
            const unAvailRoomMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: +unavail }, select: { aliases: true, shiftId: true, workload: true, user: { select: { picture: true } } } })
            const totalTask = await prisma.maidTask.count({
                where: {
                    finished: false, startTime: null,
                    roomMaidId: +unavail, AND: [
                        { created_at: { gte: `${currentDate}T00:00:00.000Z` } },
                        { created_at: { lte: `${currentDate}T23:59:59.999Z` } }
                    ]
                }
            })
            sendedData.unAvailableData = {
                image: unAvailRoomMaid.user.picture,
                aliases: unAvailRoomMaid.aliases,
                shift: unAvailRoomMaid.shiftId,
                workload: unAvailRoomMaid.workload,
                totalTask
            }
        }

        if (assigne != "0") {
            const assigneRoomMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: +assigne }, select: { aliases: true, shiftId: true, workload: true, user: { select: { picture: true } } } })
            sendedData.assigneData = {
                image: assigneRoomMaid.user.picture,
                aliases: assigneRoomMaid.aliases,
                shift: assigneRoomMaid.shiftId,
                workload: assigneRoomMaid.workload
            }
        }
        return sendedData
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addUnavailableRoomBoy = async (b) => {
    let { unAvailableId, assigneId } = b, assigned = [], totalAssigned = 0, totalAssignedToOtherMaid = 0
    const currentDate = splitDateTime(new Date().toISOString()).date
    try {
        const [unavailExist, assigneExist] = await prisma.$transaction([
            prisma.roomMaid.findFirstOrThrow({
                where: { id: +unAvailableId }, select: {
                    aliases: true,
                    MaidTask: {
                        where: {
                            created_at: { gte: `${currentDate}T00:00:00.000Z` }, finished: false
                        }, select: { id: true, customWorkload: true, type: { select: { standardTime: true } } }
                    }
                }
            }),
            prisma.roomMaid.findFirstOrThrow({ where: { id: +assigneId } })
        ])
        const sortTask = unavailExist.MaidTask.sort((a, b) => {
            if (a.customWorkload) {
                if (b.customWorkload) {
                    return b.customWorkload - a.customWorkload
                } else {
                    return b.type.standardTime - a.customWorkload
                }
            } else {
                if (b.customWorkload) {
                    return b.customWorkload - a.type.standardTime
                } else {
                    return b.type.standardTime - a.type.standardTime
                }
            }
        })
        for (let task of sortTask) {
            const assigne = await changeAssigne(task.id, assigneExist.id)
            assigned.push(assigne.updatedTask)
            if (assigne.assigned) totalAssigned++
            if (assigne.assignToAnother) totalAssignedToOtherMaid++
        }
        return { assigned, message: `${totalAssigned} task from ${unavailExist.aliases} succesfully sended to ${assigneExist.aliases} (${totalAssignedToOtherMaid > 0 ? `${totalAssignedToOtherMaid} Task sended to Another Maid` : ''})` }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const changeAssigne = async (taskId, toMaidId) => {
    let updatedTask, assigned = false, assignToAnother = false
    try {
        const [taskExist, maidExist] = await prisma.$transaction([
            prisma.maidTask.findFirstOrThrow({ where: { id: +taskId }, select: { customWorkload: true, type: { select: { id: true, standardTime: true } }, roomMaid: true } }),
            prisma.roomMaid.findFirstOrThrow({ where: { id: +toMaidId }, select: { aliases: true, workload: true, id: true } })
        ])
        const taskWorkload = taskExist.customWorkload != null ? taskExist.customWorkload : taskExist.type.standardTime
        const canWorkOnTask = maidExist.workload + taskWorkload < 480 ? true : false
        if (canWorkOnTask) {
            updatedTask = await prisma.maidTask.update({ where: { id: +taskId }, data: { assignToAnotherMaid: true, assignedBeforeId: taskExist.roomMaid.id, roomMaidId: maidExist.id } })
            assigned = true
        } else {
            const getAnotherRecommendedMaid = await prisma.roomMaid.findFirst({ where: { NOT: [{ AND: [{ id: taskExist.roomMaid.id }, { id: +toMaidId }] }, { workload: { gte: 480 } }] }, select: { id: true }, orderBy: { workload: 'asc' } })
            updatedTask = await prisma.maidTask.update({ where: { id: +taskId }, data: { assignToAnotherMaid: true, assignedBeforeId: taskExist.roomMaid.id, roomMaidId: getAnotherRecommendedMaid.id } })
            assignToAnother = true
        }
        return { updatedTask, assigned, assignToAnother }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addNewSupervisorTask = async (body) => {
    let { roomNo, maidId } = body
    try {
        delete body.roomNo, delete body.maidId
        body.typeId = "SPVTASK"
        console.log(body, roomNo, maidId)
        const createdTask = await task.createNewMaidTask(maidId, roomNo, body)
        return createdTask
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const isSupervisor = async (supervisorId) => {
    try {
        return await prisma.user.findFirstOrThrow({ where: { role: { name: "Supervisor" }, id: +supervisorId, deleted: false } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSupervisorData, isSupervisor, addUnavailableRoomBoy, helperUnavailableRoomBoy, addNewSupervisorTask, helperAddTask,helperChangeStatus }