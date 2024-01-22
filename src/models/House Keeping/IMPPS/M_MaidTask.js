const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, formatToSchedule, splitDateTime, getWorkingShifts } = require("../../../utils/helper")

const assignTask = async (action, roomId, taskRemarks) => {
    let assigne = []
    try {
        const [rooms] = await prisma.$transaction([
            prisma.room.findMany({ select: { id: true, roomType: true, roomStatus: true, occupied_status: true }, orderBy: { occupied_status: 'desc' } }),
        ])
        switch (action) {
            case "GUEREQ":
                const exist = rooms.some(room => room.id === roomId);
                if (!exist) throw Error(`Room ${roomId} doesn't exist`)
                const workingShift = await getWorkingShifts(new Date())

                let workloads = {}
                for (let shift of workingShift) {
                    for (let workload of shift.RoomMaid) workloads[workload.id] = (workload.workload)
                }
                workloads = Object.values(workloads)
                const lowestWorkload = Math.min(...workloads)
                break;
            case "DLYCLEAN":
                for (let room of rooms) {
                    const rms = await prisma.roomMaid.findMany({ select: { id: true, workload: true, shiftId: true, currentSchedule: true, user: { select: { name: true } } }, orderBy: { shiftId: 'asc' } })
                    let clnType = "CLN", shift = 0, workload = 0, prevSchedule
                    if (room.occupied_status != false) clnType = `FCLN-${room.roomType}`
                    const task = await prisma.taskType.findFirstOrThrow({ where: { id: clnType } })
                    do {
                        shift++
                        prevSchedule = rms[shift - 1].currentSchedule
                        workload = rms[shift - 1].workload + task.standardTime
                    } while (workload > 480)
                    const currentSchedule = formatToSchedule(prevSchedule, task.standardTime)
                    const [createdTask, assignedRoomMaid] = await prisma.$transaction([
                        prisma.maidTask.create({ data: { roomId: room.id, roomMaidId: rms[shift - 1].id, typeId: clnType, request: taskRemarks ? taskRemarks : "Messy room", status: "Need to be cleaned" } }),
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