const { assignCleaningTask, assignTask, genearateListOfTask, taskAction } = require("../../../models/House Keeping/IMPPS/M_MaidTask")
const { resetRoomMaid, getRoomMaidTaskById, getAllRoomMaid } = require("../../../models/House Keeping/M_RoomMaid")
const { ThrowError } = require("../../../utils/helper")
const { error, success } = require("../../../utils/response")

const get = async (req, res) => {
    const { id } = req.params
    try {
        const { performance, listTask } = await getRoomMaidTaskById(+id, req.query)
        return success(res, 'Operation Success', { performance, listTask })
    } catch (err) {
        return error(res, err.message)
    }
}

const getAll = async (req, res) => {
    try {
        const roomMaids = await getAllRoomMaid()
        return success(res, 'Operation Success', roomMaids)
    } catch (err) {
        return error(res, err.message)
    }
}

const post = async (req, res) => {
    let { action, taskId, id } = req.params, data
    try {
        switch (action) {
            case "start-task":
                data = await taskAction("start", +id, +taskId)
                break;
            case "end-task":
                data = await taskAction("end", +id, +taskId)
                break;
            case "re-clean":
                data = await taskAction('re-clean', +id, +taskId)
                break;
            case "ok":
                data = await taskAction('ok', +id, +taskId)
                break;
            default:
                throw Error('No Action Matched')
        }
        return success(res, 'Operation Success', data)
    } catch (err) {
        return error(res, err.message)
    }
}

const dailyCleaning = async (req, res) => {
    try {
        const assigne = await genearateListOfTask("DLYCLEAN")
        return success(res, 'Operation Success', assigne)
    } catch (err) {
        return error(res, err.message)
    }
}

const amenitiesTask = async (req, res) => {
    const { roomId } = req.params
    try {
        const task = await genearateListOfTask("GUEREQ", +roomId, "Please fast, my Tochter need this asf", 110, 2)
        return success(res, 'Success', task)
    } catch (err) {
        return error(res, err.message)
    }
}

const resetSchedule = async (req, res) => {
    try {
        const roomMaid = await resetRoomMaid()
        return success(res, roomMaid)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get, dailyCleaning, amenitiesTask, getAll, resetSchedule, post }