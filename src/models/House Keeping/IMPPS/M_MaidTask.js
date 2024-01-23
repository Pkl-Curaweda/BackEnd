const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatToSchedule, splitDateTime, getWorkingShifts } = require("../../../utils/helper")
const { createNotification } = require("../../Authorization/M_Notitication")

const assignTask = async (action, roomId, request, article) => {
    let assigne = []
    try {
        const [rooms] = await prisma.$transaction([
            prisma.room.findMany({ select: { id: true, roomType: true, roomStatus: true, occupied_status: true }, orderBy: { occupied_status: 'desc' } }),
        ])
        if (article != undefined) article = await prisma.articleType.findFirstOrThrow({ where: { id: article }, select: { description: true } })
        switch (action) {
            case "GUEREQ":
                let lowestRoomMaidId;
                let lowestWorkload = Infinity;
                const exist = rooms.some(room => room.id === roomId);
                if (!exist) throw Error(`Room ${roomId} doesn't exist`)
                const workingShift = await getWorkingShifts(new Date())
                for (let shift of workingShift) {
                    for (let workload of shift.RoomMaid) {
                        console.log(workload)
                        if (workload.workload < lowestWorkload) {
                            lowestWorkload = workload.workload;
                            lowestRoomMaidId = workload.id;
                        }
                    }
                }
                const maidTask = await prisma.maidTask.create({ data: { roomId, request, roomMaidId: lowestRoomMaidId, typeId: "GREQ" } })
                await createNotification({ content: `Room ${roomId} need ${article.description}` })
                return maidTask
            case "DLYCLEAN":
                for (let room of rooms) {
                    const rms = await prisma.roomMaid.findMany({ select: { id: true, workload: true, shift: { select: { restTimeStart: true, restTimeEnd: true } }, currentSchedule: true, user: { select: { name: true } } }, orderBy: { shiftId: 'asc' } })
                    let clnType = "CLN", shift = 0, workload = 0, prevSchedule, nextSchedule
                    if (room.occupied_status != false) clnType = `FCLN-${room.roomType}`
                    const task = await prisma.taskType.findFirstOrThrow({ where: { id: clnType } })
                    do {
                        shift++
                        prevSchedule = rms[shift - 1].currentSchedule
                        nextSchedule = formatToSchedule(prevSchedule, task.standardTime)
                        if (prevSchedule === rms[shift - 1].shift.restTimeStart || nextSchedule >= rms[shift - 1].shift.restTimeStart && nextSchedule < rms[shift - 1].shift.restTimeEnd) {
                            await prisma.roomMaid.update({ where: { id: rms[shift - 1].id }, data: { currentSchedule: rms[shift - 1].shift.restTimeEnd } })
                            shift++
                        }
                        workload = rms[shift - 1].workload + task.standardTime
                    } while (workload > 480)
                    prevSchedule = rms[shift - 1].currentSchedule
                    const currentSchedule = formatToSchedule(prevSchedule, task.standardTime)
                    const [createdTask, assignedRoomMaid] = await prisma.$transaction([
                        prisma.maidTask.create({ data: { roomId: room.id, roomMaidId: rms[shift - 1].id, typeId: clnType, request: request ? request : "Messy room", status: "Need to be cleaned" } }),
                        prisma.roomMaid.update({ where: { id: rms[shift - 1].id }, data: { workload: rms[shift - 1].workload + task.standardTime, currentSchedule } })
                    ])
                    assigne.push({
                        room: room.id,
                        task: 'Cleaning',
                        roomMaid: assignedRoomMaid.aliases,
                        workload: {
                            time: task.standardTime,
                            schedule: `${prevSchedule} - ${currentSchedule}`,
                            before: rms[shift - 1].workload,
                            after: assignedRoomMaid.workload
                        }
                    })
                }
                break;
            default:
                throw Error('No action matched')
        }
        return { assigne }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { assignTask }