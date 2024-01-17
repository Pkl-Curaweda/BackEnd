const { getRoomOccupancyData } = require("../../models/House Keeping/M_RoomOcc");
const { ThrowError } = require("../../utils/helper");
const { success, error } = require("../../utils/response");

const get = async (req, res) => {
    try {
        const roomOcc = await getRoomOccupancyData(req.query);
        return success(res, 'Operation Succes', roomOcc)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get }