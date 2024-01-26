const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatToSchedule, splitDateTime, getWorkingShifts } = require("../../../utils/helper")
const { createNotification } = require("../../Authorization/M_Notitication")

const assignTask = async (tasks = [{ action: 'GUEREQ', roomId: 101, request: 'Request / Note', workload: 0, typeId: 'CLN' }]) => {
    let assigne = [], currentDate = new Date(), currentSchedule; //The example of current schedule is a string like this: 08:00

    try {
        for (let task of tasks) {
            let { roomId, request, workload, action, typeId } = task, maidWorkload = 0, lowestRoomMaidId = 0, lowestWorkload = Infinity, hours, minutes;
            const [shift, latestTask] = await prisma.$transaction([
                prisma.shift.findFirst({ where: { id: 1 }, select: { startTime: true } }),
                prisma.maidTask.findFirst({ where: { AND: [{ created_at: { gte: `${currentDate.toISOString().split('T')[0]}T00:00:00.000Z` } }, { created_at: { lte: currentDate.toISOString() } }] }, orderBy: { created_at: 'desc' } })
            ])
            if (action === "DLYCLEAN") {
                currentSchedule = latestTask != null ? latestTask.schedule.split('-')[1] : shift.startTime
                console.log(currentSchedule)
                hours = parseInt(currentSchedule.split(":")[0])
                minutes = parseInt(currentSchedule.split(":")[1])
            } else {
                const { time } = splitDateTime(currentDate.toISOString())
                console.log(time)
                hours = parseInt(time.split(':')[0])  + 7
                minutes = parseInt(time.split(':')[1])
                currentSchedule = `${hours}:${minutes}`
                console.log(hours, minutes)
            }
            console.log(action)
            console.log(hours, minutes)
            currentDate.setHours(hours);
            currentDate.setMinutes(minutes);

            console.log(currentDate)
            const workingShift = await getWorkingShifts(currentDate)
            do {
                while (lowestRoomMaidId < 1) {
                    if (workingShift.length > 0) {
                        for (let shift of workingShift) {
                            for (let workload of shift.RoomMaid) {
                                if (workload.workload < 480) {
                                    if (workload.workload < lowestWorkload) {
                                        lowestWorkload = workload.workload;
                                        lowestRoomMaidId = workload.id;
                                    }
                                }
                            }
                        }
                    } else throw Error('No one is working on this shift')
                }
                maidWorkload = lowestWorkload + workload
            } while (workload > 480)
            const previousSchedule = currentSchedule
            currentSchedule = formatToSchedule(currentSchedule, workload)
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

module.exports = { genearateListOfTask }