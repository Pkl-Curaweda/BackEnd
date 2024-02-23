const { create } = require("qrcode")
const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatToSchedule, splitDateTime, getWorkingShifts, getLowestWorkloadShift } = require("../../../utils/helper")
const { createNotification } = require("../../Authorization/M_Notitication")
const { countTaskPerformance, countActual, resetRoomMaid, isRoomMaid } = require("./M_RoomMaid")
const { warnEnvConflicts } = require("@prisma/client/runtime/library")

const getAllToday = async (where, select, orderBy, take = 5, skip = 1) => {
    try {
        const currDate = new Date().toISOString().split('T')[0]
        return await prisma.maidTask.findMany({
            where: {
                ...where,
                AND: [
                    { created_at: { gte: `${currDate}T00:00:00.000Z` } },
                    { created_at: { lte: `${currDate}T23:59:59.999Z` } }
                ]
            }, ...(select && { select }), ...(orderBy && { orderBy }), ...(take && { take: +take }), ...(skip && { skip: (skip - 1) * take })
        })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getAllWorkingTaskId = async () => {
    try {
        return await prisma.roomMaid.findMany({ select: { id: true, currentTask: true } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const assignTask = async (tasks = [{ action: 'GUEREQ', roomId: 101, request: 'Request / Note', workload: 0, typeId: 'CLN' }]) => {
    let assigne = [], currentDate = new Date(), currentSchedule, previousSchedule; //The example of current schedule is a string like this: 08:00
    const [shift, latestTask] = await prisma.$transaction([
        prisma.shift.findFirst({ where: { id: 1 }, select: { startTime: true } }),
        prisma.maidTask.findFirst({ where: { AND: [{ created_at: { gte: `${currentDate.toISOString().split('T')[0]}T00:00:00.000Z` } }, { created_at: { lte: currentDate.toISOString() } }] }, orderBy: { created_at: 'desc' } })
    ])
    //if latestTask wasn't find while findFirst, then it mean this was the first task of a new day
    if (latestTask === null) await resetRoomMaid() //function reset all workload of maid

    try {
        tasks.sort((a, b) => b.workload - a.workload)
        for (let task of tasks) {
            let { roomId, request, workload, action, typeId } = task, maidWorkload = 0, lowestRoomMaidId = 0, lowestWorkload = Infinity, hours, minutes;
            if (currentSchedule === undefined) {
                if (action === "DLYCLEAN") {
                    currentSchedule = latestTask != null ? latestTask.schedule.split('-')[1] : shift.startTime
                    hours = parseInt(currentSchedule.split(":")[0])
                    minutes = parseInt(currentSchedule.split(":")[1])
                } else {
                    const { time } = splitDateTime(currentDate.toISOString())
                    hours = time.split(':')[0]
                    minutes = time.split(':')[1]
                    currentSchedule = `${hours}:${minutes}`
                }
                currentDate.setHours(hours);
                currentDate.setMinutes(minutes);
            } previousSchedule = currentSchedule
            console.log(currentSchedule, workload)
            currentSchedule = formatToSchedule(currentSchedule, workload)
            const choosenMaid = await getLowestWorkloadShift(currentSchedule)
            lowestRoomMaidId = choosenMaid.id
            lowestWorkload = choosenMaid.workload

            maidWorkload = lowestWorkload + workload
            const [createdTask, assigned] = await prisma.$transaction([
                prisma.maidTask.create({ data: { roomId, request, roomMaidId: lowestRoomMaidId, schedule: `${previousSchedule}-${currentSchedule}`, typeId } }),
                prisma.roomMaid.update({ where: { id: lowestRoomMaidId }, data: { workload: maidWorkload } })
            ])
            await createNotification({ content: request })
            assigne.push({
                room: roomId,
                task: action,
                roomMaid: assigned.aliases,
                workload: {
                    time: workload,
                    schedule: `${previousSchedule} - ${currentSchedule}`,
                    maidWorkload: assigned.workload
                }
            })
        }
        return assigne
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const genearateListOfTask = async (action, roomId, request, article, articleQty) => {
    let assigne = [], taskWorkload = {}
    try {
        const taskTypes = await prisma.taskType.findMany()
        for (let taskType of taskTypes) taskWorkload[taskType.id] = taskType.standardTime
        switch (action) {
            case "GUEREQ":
                const [artType, roomExist] = await prisma.$transaction([
                    prisma.articleType.findFirstOrThrow({ where: { id: article, deleted: false }, select: { description: true } }),
                    prisma.room.findFirstOrThrow({ where: { id: +roomId, deleted: false } })
                ])
                request = `Room ${roomId} ${article ? `need ${articleQty} ${artType.description}` : `send a request "${request}"`}`
                assigne = await assignTask([{ action, roomId, request, workload: taskWorkload['GREQ'], typeId: `GREQ` }])
                break;
            case "DLYCLEAN":
                const listTask = []
                const rooms = await prisma.room.findMany({ where: { deleted: false, NOT: { id: 0 } }, include: { roomType: true } })
                for (let room of rooms) {
                    const tt = room.occupied_status != false ? `FCLN-${room.roomType.id}` : 'CLN'
                    listTask.push({ action, roomId: room.id, request: "Need to be cleaned", workload: taskWorkload[tt], typeId: tt })
                }
                assigne = await assignTask(listTask)
                break;
            default:
                throw Error('No action matched')
        }
        return assigne
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const taskAction = async (action, maidId, taskId, payload = { comment: '', performance: '' }) => {
    let updateTask, updateMaid, message = ''
    try {
        const task = await prisma.maidTask.findFirstOrThrow({ where: { id: taskId }, include: { roomMaid: true } })
        if (maidId === undefined) maidId = task.roomMaid.id
        const roomMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: maidId }, include: { user: true } })
        if (task.roomMaidId != maidId) throw Error(`Task not assigned to ${roomMaid.aliases}`)
        const currentDate = new Date().toISOString()
        if (task.finished != false) throw Error('Task already finished')
        switch (action) {
            case "start":
                if (task.endTime != null) throw Error('This task needed to be checked first')
                if (roomMaid.currentTask === taskId) throw Error('You already start this task, please finish it first')
                if (roomMaid.currentTask != null) throw Error("You need to finish your current task first")
                if (roomMaid.urgentTask != null && roomMaid.urgentTask != taskId) throw Error("You need to finish your urgent task first")
                updateTask = await prisma.maidTask.update({ where: { id: taskId }, data: { startTime: currentDate, status: "Working on it", rowColor: "FFFC9B", mainStatus: "ON PROGRESS" } })
                updateMaid = await prisma.roomMaid.update({ where: { id: maidId }, data: { currentTask: taskId } })
                message = `Room Maid ${roomMaid.aliases} | Starting new Task`
                break;
            case "end":
                if (roomMaid.currentTask != taskId && task.startTime === null || roomMaid.urgentTask != taskId && task.startTime === null) throw Error("You cannot end this task, need to be started")
                const removeTask = roomMaid.currentTask === taskId ? { currentTask: null } : { urgentTask: null }
                updateTask = await prisma.maidTask.update({ where: { id: taskId }, data: { endTime: currentDate, status: "Need to be check", rowColor: "B7E5B4", mainStatus: "CHECKING" } })
                updateMaid = await prisma.roomMaid.update({ where: { id: maidId }, data: { ...(removeTask) } })
                messageSend = `Room Maid ${roomMaid.aliases} | Finishing Task`
                break;
            case "re-clean":
                if (roomMaid.urgentTask === task.id) throw Error(`You already give this task to ${roomMaid.aliases}`)
                if (roomMaid.urgentTask != null && roomMaid.urgentTask != taskId) throw Error(`Slown down please, you already give task to ${roomMaid.user.name}`)
                updateTask = await prisma.maidTask.update({ where: { id: taskId }, data: { status: "Re-Clean", mainStatus: "ON PROGRESS", comment: payload.comment, rowColor: "F28585", endTime: null, checkedTime: currentDate }, select: { roomId: true } })
                updateMaid = await prisma.roomMaid.update({ where: { id: maidId }, data: { urgentTask: taskId }, select: { user: { select: { name: true } } } })
                await createNotification({ content: `${updateMaid.user.name} please clean room no ${updateTask.roomId}` })
                message = `Supervisor requesting Re - Clean to Room Maid ${roomMaid.aliases}`
                break;
            case "ok":
                if (task.endTime === null) throw Error('Maid still working on this, please wait')
                const maidPerfomance = await countTaskPerformance(task.id, payload.performance)
                const rawPerfomance = maidPerfomance + roomMaid.rawPerfomance
                const { actual, UoM } = await countActual(task.startTime, task.endTime)
                updateTask = await prisma.maidTask.update({ where: { id: taskId }, data: { status: "Checked (OK)", mainStatus: "DONE", finished: true, performance: maidPerfomance, comment: payload.comment, actual, UoM, rowColor: "BBE2EC", checkedTime: currentDate } })
                updateMaid = await prisma.roomMaid.update({ where: { id: maidId }, data: { rawPerfomance, finishedTask: roomMaid.finishedTask + 1 } })
                await createNotification({ content: `Task / Request ${task.roomId} finished` })
                message = `Task finished`
                break;
            default:
                throw Error('No action matched')
        }
        return { updateMaid, updateTask, message }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const createNewMaidTask = async (roomMaidId, roomId, data) => {
    try {
        const { time } = splitDateTime(new Date().toISOString())
        const [hours, minutes] = time.split(':')
        const currentTime = `${hours}:${minutes}`
        const [roomMaid, room] = await prisma.$transaction([
            prisma.roomMaid.findFirstOrThrow({ where: { id: roomMaidId, deleted: false } }),
            prisma.room.findFirstOrThrow({ where: { id: roomId, deleted: false } })
        ])
        const canWorkOnTask = roomMaid.workload + data.customWorkload < 480
        const scheduleEnd = formatToSchedule(currentTime, data.customWorkload)
        data.schedule = `${currentTime}-${scheduleEnd}`
        if (!canWorkOnTask) throw Error('Please assign another maid for this task')
        const createdTask = await prisma.maidTask.create({
            data: {
                roomId: room.id,
                roomMaidId,
                ...data
            }
        })
        return createdTask
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const updateTask = async (taskId, data) => {
    try {
        const exist = await prisma.maidTask.findFirstOrThrow({ where: { id: taskId } })
        return await prisma.maidTask.update({ where: { id: exist.id }, data })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}
module.exports = { genearateListOfTask, getAllToday, getAllWorkingTaskId, taskAction, updateTask, createNewMaidTask }