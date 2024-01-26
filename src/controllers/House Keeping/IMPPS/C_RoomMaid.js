const { assignCleaningTask, assignTask, genearateListOfTask } = require("../../../models/House Keeping/IMPPS/M_MaidTask")
const { resetRoomMaid, getRoomMaidTaskById, getAllRoomMaid } = require("../../../models/House Keeping/M_RoomMaid")
const { ThrowError } = require("../../../utils/helper")
const { error, success } = require("../../../utils/response")

const get = async (req, res) => {
    const { id } = req.params
    try {
        const { performance, listTask } = await getRoomMaidTaskById(+id)
        return success(res, 'Operation Success', { performance, listTask })
    } catch (err) {
        return error(res, err.message)
    }
}

const getAll = async (req, res) => {
    try{
        const roomMaids = await getAllRoomMaid()
        return success(res, 'Operation Success', roomMaids)
    }catch(err){
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
        console.log(`
⢀⣶⣿⣷⣦⣙⠶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢹⣿⣿⣿⣿⣷⣤⣉⠛⣡⣅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢠⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠉⠻⣿⣿⣿⣿⣿⣿⣿⣷⡌⠻⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⠛⠛⢿⣿⣿⣿⣿⠇⠈⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣷⣖⣤⣾⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣦⡀⢤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣿⣿⣿⣌⠹⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⠚⠉⠈⠉⠉⠻⢶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣁⣤⣾⡇⢻⡶⢦⡬⢿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠿⠛⢡⣷⣾⡄⠀⠀⠈⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣟⣻⣿⣗⠀⠈⠳⠀⠀⠀⠀⠀⠀⠀⠀⠀⢘⣿⡟⠒⣼⡿⠟⠃⠀⠀⣼⡽⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣴⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣷⣜⣉⣁⣀⣠⣄⣹⢥⠞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣦⡀⢦⡀⠀⠀⠀⠀⠀⠀⠀⠈⢹⣿⣿⣿⣿⣿⣏⣻⣟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⣿⣿⣷⣾⡗⣆⠀⢀⠀⠀⠀⠀⠀⣨⡿⠟⣍⠻⡍⠉⠁⠙⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠧⠄⠀⠠⠄⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢻⡄⠈⠁⠸⣤⣤⠾⠁⠀⠐⠹⣦⠤⠄⠒⠉⠈⠳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⡄⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣼⣧⢰⣷⢤⣽⣿⣿⣷⣦⣄⢀⣠⡴⠶⣤⣤⡤⢝⠺⠗⠒⠦⠤⢤⣀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣆⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⢯⣿⡃⠀⠈⠛⠁⠙⣿⣿⣿⡹⠖⠀⠀⠀⠧⢤⣀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠆⠀⠀⠹⣿⣿⣿⣿⣿⡿⠟⢹⡅⠀⠀⠀⠀⠀⠈⢿⢿⣿⣦⡀⠀⠀⠀⠀⠈⢙⠿⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⣿⣿⣿⡀⠀⣸⡷⠒⠋⠀⠀⠀⠀⠈⠉⠙⢿⣷⣦⣀⠀⠀⠀⣞⣷⠀⠈⣶⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⡗⠒⢻⡇⠀⠀⠀⢀⣤⣤⣤⡅⠒⠲⣝⠿⠛⠛⠓⠦⣯⣝⠃⠀⢸⡗⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⢹⣿⣄⣠⣴⣶⣿⣿⡿⣿⣿⠗⠃⠀⠀⠈⡇⠀⠀⠀⠀⠀⠈⠁⠳⢾⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⡗⣉⣴⣷⣤⡀⠤⠤⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡿⠟⠋⠉⠉⠉⠈⣿⣿⣷⣿⣿⣷⣄⣰⣿⣷⣶⡦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⢯⡾⠀⠀⠀⠀⠀⢠⠉⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⢟⡖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣦⣤⣤⣀⣀⣀⡀
        `)
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

module.exports = { get, dailyCleaning, amenitiesTask, getAll,resetSchedule }