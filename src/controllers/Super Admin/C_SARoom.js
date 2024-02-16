const { upsertRoom, getSARoom } = require("../../models/House Keeping/M_Room")
const { error } = require("../../utils/response")

const get = async () => {
    try {
        const rooms = await getSARoom()
    } catch (err) {
        return error(res, err.message)
    }
}

const addEditRoom = async (req, res) => {
    const { id } = req.params
    try {
        const room = await upsertRoom(id, req.body)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get, addEditRoom }