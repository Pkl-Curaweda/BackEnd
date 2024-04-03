const { prisma } = require("../../../../prisma/seeder/config")
const { updateTask } = require("../../../models/House Keeping/IMPPS/M_MaidTask")
const { getSupervisorData, addUnavailableRoomBoy, helperUnavailableRoomBoy, addNewTask, helperAddTask, addNewSupervisorTask, helperChangeStatus } = require("../../../models/House Keeping/IMPPS/M_Supervisor")
const { formatToSchedule } = require("../../../utils/helper")
const { error, success } = require("../../../utils/response")

const get = async (req, res) => {
    try {
        const data = await getSupervisorData(req.query)
        return success(res, 'Get Success', data)
    } catch (err) {
        return error(res, err.message)
    }
}


const getHelper = async (req, res) => {
    let { ident } = req.params, data
    try {
        switch (ident) {
            case "unavail":
                data = await helperUnavailableRoomBoy(req.query)
                break;
            case "add":
                data = await helperAddTask(req.query)
                break;
            case "room":
                data = await helperChangeStatus()
                break;
            default:
                throw Error('No Identifier Match')
        }
        return success(res, 'Helper running', data)
    } catch (err) {
        return error(res, err.message)
    }
}

const changeSchedule = async (req, res) => {
    let { id } = req.params, { startTime } = req.body
    let schedule = `${startTime} - `, workloadToAdd
    try {
        const timeToIso = (timeParts) => {
            var currentDate = new Date();
            var splitTime = timeParts.split(":");
            var hours = parseInt(splitTime[0], 10);
            var minutes = parseInt(splitTime[1], 10);
            currentDate.setHours(hours);
            currentDate.setMinutes(minutes);
            return currentDate.toISOString()
        }

        const startTimeIso = timeToIso(startTime)
        if(new Date().toISOString() > startTimeIso) throw Error('Time already passed')
        const task = await prisma.maidTask.findFirstOrThrow({ where: { id: +id }, select: { customWorkload: true, type: { select: { standardTime: true } } } })
        workloadToAdd = task.customWorkload ? task.customWorkload : task.type.standardTime
        const endTime = formatToSchedule(startTime, workloadToAdd)
        schedule += endTime
        const updatedTask = await updateTask(+id, { schedule, created_at: startTimeIso })
        return success(res, 'Schedule updated', updatedTask)
    } catch (err) {
        return success(res, err.message)
    }
}

const postNewTask = async (req, res) => {
    try {
        const createdTask = await addNewSupervisorTask(req.body)
        return success(res, 'Task created succesfully', createdTask)
    } catch (err) {
        return error(res, err.message)
    }
}

const postUnavailRoomBoy = async (req, res) => {
    try {
        const updated = await addUnavailableRoomBoy(req.body)
        return success(res, updated.message, updated.assigned)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get, postNewTask, postUnavailRoomBoy, getHelper, changeSchedule }