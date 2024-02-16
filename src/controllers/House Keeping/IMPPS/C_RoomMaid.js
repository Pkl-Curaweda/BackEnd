const { assignCleaningTask, assignTask, genearateListOfTask, taskAction, updateTask } = require("../../../models/House Keeping/IMPPS/M_MaidTask")
const { isSupervisor } = require("../../../models/House Keeping/IMPPS/M_Supervisor")
const { resetRoomMaid, getRoomMaidTaskById, getAllRoomMaid, createRoomMaid, isRoomMaid } = require("../../../models/House Keeping/IMPPS/M_RoomMaid")
const { ThrowError } = require("../../../utils/helper")
const { error, success } = require("../../../utils/response")

const get = async (req, res) => {
    const user = req.user
    try {
        const roomMaid = await isRoomMaid(user.id)
        const { maidName, performance, listTask } = await getRoomMaidTaskById(roomMaid.id, req.query)
        return success(res, `Get Success`, { maidName, performance, listTask })
    } catch (err) {
        return error(res, err.message)
    }
}

const getAll = async (req, res) => {
    try {
        const roomMaids = await getAllRoomMaid()
        return success(res, 'Get Success', roomMaids)
    } catch (err) {
        return error(res, err.message)
    }
}

const post = async (req, res) => {
    let { action, taskId } = req.params, data, id
    if (action != "re-clean" && action != "ok") {
        await isRoomMaid(req.user.id).then(maid => { id = maid.id })
    } else await isSupervisor(req.user.id)
    let { comment = '', performance = 5 } = req.body
    try {
        switch (action) {
            case "start-task":
                data = await taskAction("start", +id, +taskId)
                break;
            case "end-task":
                data = await taskAction("end", +id, +taskId)
                break;
            case "re-clean":
                data = await taskAction('re-clean', undefined, +taskId, { comment })
                break;
            case "ok":
                data = await taskAction('ok', undefined, +taskId, { comment, performance })
                break;
            default:
                throw Error('No Action Matched')
        }
        return success(res, data.message, data)
    } catch (err) {
        return error(res, err.message)
    }
}

const submitComment = async (req, res) => {
    const { taskId } = req.params, { comment } = req.body
    try {
        const task = await updateTask(+taskId, { comment })
        return success(res, 'Comment sended...', task)
    } catch (err) {
        return error(res, err.message)
    }
}

const dailyCleaning = async (req, res) => {
    try {
        const assigne = await genearateListOfTask("DLYCLEAN")
        return success(res, 'Daily Cleaning Task Assigned', assigne)
    } catch (err) {
        return error(res, err.message)
    }
}

const amenitiesTask = async (req, res) => {
    const { roomId } = req.params
    try {
        const task = await genearateListOfTask("GUEREQ", +roomId, "Please fast, my Tochter need this asf", 110, 2)
        return success(res, `Task Assigned`, task)
    } catch (err) {
        return error(res, err.message)
    }
}

const resetSchedule = async (req, res) => {
    try {
        const roomMaid = await resetRoomMaid()
        return success(res, 'Reset All Room Maid Workload', roomMaid)
    } catch (err) {
        return error(res, err.message)
    }
}

const postCreateRoomMaid = async (req, res) => {
    try {
        const createdRoomMaid = await createRoomMaid(req.body)
        return success(res, 'Room Maid Created Successfully', createdRoomMaid)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get, dailyCleaning, amenitiesTask, getAll, resetSchedule, post, postCreateRoomMaid, submitComment }