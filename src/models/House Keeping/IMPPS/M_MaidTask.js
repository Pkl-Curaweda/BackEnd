const { create } = require("qrcode")
const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatToSchedule, splitDateTime, getWorkingShifts } = require("../../../utils/helper")
const { createNotification } = require("../../Authorization/M_Notitication")
const { countTaskPerformance, countActual } = require("../M_RoomMaid")
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
    let assigne = [], currentDate = new Date(), currentSchedule; //The example of current schedule is a string like this: 08:00

    try {
        for (let task of tasks) {
            let { roomId, request, workload, action, typeId } = task, maidWorkload = 0, lowestRoomMaidId = 0, lowestWorkload = Infinity, hours, minutes;
            const [shift, latestTask] = await prisma.$transaction([
                prisma.shift.findFirst({ where: { id: 1 }, select: { startTime: true } }),
                prisma.maidTask.findFirst({ where: { AND: [{ created_at: { gte: `${currentDate.toISOString().split('T')[0]}T00:00:00.000Z` } }, { created_at: { lte: currentDate.toISOString() } }] }, orderBy: { created_at: 'desc' } })
            ])
            if (currentSchedule === undefined) {
                if (action === "DLYCLEAN") {
                    currentSchedule = latestTask != null ? latestTask.schedule.split('-')[1] : shift.startTime
                    console.log(currentSchedule)
                    hours = parseInt(currentSchedule.split(":")[0])
                    minutes = parseInt(currentSchedule.split(":")[1])
                } else {
                    const { time } = splitDateTime(currentDate.toISOString())
                    console.log(time)
                    hours = parseInt(time.split(':')[0]) + 7
                    minutes = parseInt(time.split(':')[1])
                    currentSchedule = `${hours}:${minutes}`
                    console.log(hours, minutes)
                }
                currentDate.setHours(hours);
                currentDate.setMinutes(minutes);
            }

            const workingShift = await getWorkingShifts(currentDate)
            do {
                console.log(workingShift)
                console.log(workload)
                while (lowestRoomMaidId < 1) {
                    if (workingShift.length > 0) {
                        for (let shift of workingShift) {
                            for (let workload of shift.RoomMaid) {
                                console.log(workload.workload)
                                if (workload.workload < 480) {
                                    if (workload.workload < lowestWorkload) {
                                        lowestWorkload = workload.workload;
                                        lowestRoomMaidId = workload.id;
                                    }
                                } else continue
                            }
                        }
                    } else throw Error('No one is working on this shift')
                }
                maidWorkload = lowestWorkload + workload
            } while (workload > 480)
            const previousSchedule = currentSchedule
            console.log(currentSchedule)
            currentSchedule = formatToSchedule(currentSchedule, workload)
            console.log(currentSchedule)
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
            console.log(assigne)
        }

        // const [rooms] = await prisma.room.findMany({ select: { id: true, roomType: true, roomStatus: true, occupied_status: true }, orderBy: { occupied_status: 'desc' } })
        // if (article != undefined) article = await prisma.articleType.findFirstOrThrow({ where: { id: article }, select: { description: true } })
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
                    prisma.articleType.findFirstOrThrow({ where: { id: article }, select: { description: true } }),
                    prisma.room.findFirstOrThrow({ where: { id: +roomId } })
                ])
                request = `Room ${roomId} ${article ? `need ${articleQty} ${artType.description}` : `send a request "${request}"`}`
                assigne = await assignTask([{ action, roomId, request, workload: taskWorkload['GREQ'], typeId: `GREQ` }])
                // let lowestRoomMaidId;
                // let lowestWorkload = Infinity;
                // for (let shift of workingShift) {
                //     for (let workload of shift.RoomMaid) {
                //         if (workload.workload < lowestWorkload) {
                //             lowestWorkload = workload.workload;
                //             lowestRoomMaidId = workload.id;
                //         }
                //     }
                // }
                // const maidTask = await prisma.maidTask.create({ data: { roomId, request, roomMaidId: lowestRoomMaidId, typeId: "GREQ" } })
                // return maidTask
                break;
            case "DLYCLEAN":
                const listTask = []
                const rooms = await prisma.room.findMany()
                for (let room of rooms) {
                    const tt = room.occupied_status != false ? `FCLN-${room.roomType}` : 'CLN'
                    listTask.push({ action, roomId: room.id, request: "Need to be cleaned", workload: taskWorkload[tt], typeId: tt })
                    // const rms = await prisma.roomMaid.findMany({ select: { id: true, workload: true, shift: { select: { restTimeStart: true, restTimeEnd: true } }, currentSchedule: true, user: { select: { name: true } } }, orderBy: { shiftId: 'asc' } })
                    // let clnType = "CLN", shift = 0, workload = 0, prevSchedule, nextSchedule
                    // if (room.occupied_status != false) clnType = `FCLN-${room.roomType}`
                    // const task = await prisma.taskType.findFirstOrThrow({ where: { id: clnType } })
                    // do {
                    //     shift++
                    //     prevSchedule = rms[shift - 1].currentSchedule
                    //     nextSchedule = formatToSchedule(prevSchedule, task.standardTime)
                    //     if (prevSchedule === rms[shift - 1].shift.restTimeStart) {
                    //         await prisma.roomMaid.update({ where: { id: rms[shift - 1].id }, data: { currentSchedule: rms[shift - 1].shift.restTimeEnd } })
                    //         shift++
                    //     }
                    //     if (nextSchedule >= rms[shift - 1].shift.restTimeStart && nextSchedule < rms[shift - 1].shift.restTimeEnd) shift++
                    //     workload = rms[shift - 1].workload + task.standardTime
                    // } while (workload > 480)
                    // prevSchedule = rms[shift - 1].currentSchedule
                    // const currentSchedule = formatToSchedule(prevSchedule, task.standardTime)
                    // const [createdTask, assignedRoomMaid] = await prisma.$transaction([
                    //     prisma.maidTask.create({ data: { roomId: room.id, roomMaidId: rms[shift - 1].id, typeId: clnType, schedule: `${prevSchedule} - ${currentSchedule}`, request: request ? request : "Messy room", status: "Need to be cleaned" } }),
                    //     prisma.roomMaid.update({ where: { id: rms[shift - 1].id }, data: { workload: rms[shift - 1].workload + task.standardTime, currentSchedule } })
                    // ])
                    // assigne.push({
                    //     room: room.id,
                    //     task: 'Cleaning',
                    //     roomMaid: assignedRoomMaid.aliases,
                    //     workload: {
                    //         time: task.standardTime,
                    //         schedule: `${prevSchedule} - ${currentSchedule}`,
                    //         before: rms[shift - 1].workload,
                    //         after: assignedRoomMaid.workload
                    //     }
                    // })
                }
                assigne = await assignTask(listTask)
                break;
            default:
                throw Error('No action matched')
        }
        console.log(assigne)
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
        const roomMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: maidId }, include: { user: true } })
        const task = await prisma.maidTask.findFirstOrThrow({ where: { id: taskId } })
        if(task.roomMaidId != maidId) throw Error(`Task not assigned to ${roomMaid.aliases}`)
        const currentDate = new Date().toISOString()
        if (task.finished != false) throw Error('Task already finished')
        switch (action) {
            case "start":
                if(task.endTime != null) throw Error('This task needed to be checked first')
                if(roomMaid.currentTask === taskId) throw Error('You already start this task, please finish it first')
                if (roomMaid.currentTask != null) throw Error("You need to finish your current task first")
                if (roomMaid.urgentTask != null) throw Error("You need to finish your urgent task first")
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
                if (roomMaid.urgentTask != null && roomMaid.urgentTask != taskId) throw Error(`Slown down please, you already give task to ${roomMaid.user.name}`)
                updateTask = await prisma.maidTask.update({ where: { id: taskId }, data: { status: "Re-Clean", mainStatus: "ON PROGRESS", comment: payload.comment, rowColor: "F28585", endTime: null, checkedTime: currentDate }, select: { roomId: true } })
                updateMaid = await prisma.roomMaid.update({ where: { id: maidId }, data: { urgentTask: taskId }, select: { user: { select: { name: true } } } })
                await createNotification({ content: `${updateMaid.user.name} please clean room no ${updateTask.roomId}` })
                message = `Supervisor requesting Re - Clean to Room Maid ${roomMaid.aliases}`
                break;
            case "ok":
                if(task.endTime === null) throw Error('Maid still working on this, please wait')
                const maidPerfomance = await countTaskPerformance(task.id, payload.performance)
                const rawPerfomance = maidPerfomance + roomMaid.rawPerfomance
                console.log(rawPerfomance)
                const { actual, UoM } = await countActual(task.startTime, task.endTime)
                updateTask = await prisma.maidTask.update({ where: { id: taskId }, data: { status: "Checked (OK)", mainStatus: "DONE", finished: true, performance: maidPerfomance, comment: payload.comment, actual, UoM, checkedTime: currentDate } })
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

const updateTask = async (taskId, data) => {
    try{
        const exist = await prisma.maidTask.findFirstOrThrow({ where: { id: taskId } })
        return await prisma.maidTask.update({ where: { id: exist.id }, data })
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}
module.exports = { genearateListOfTask, getAllToday, getAllWorkingTaskId, taskAction, updateTask }