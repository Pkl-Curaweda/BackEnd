const { getAllRoomChange } = require("../../models/House Keeping/M_RoomChange")
const { error, success } = require("../../utils/response")

const get = async (req, res) => {
    try {
        const roomChangeData = await getAllRoomChange(req.query)
        return success(res, 'Get Success', roomChangeData)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get }