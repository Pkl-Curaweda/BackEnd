const { addEditRoom, getSARoom, deleteRoom, deleteSARoom, addEditRoomType, addEditArrangment, deleteRoomType } = require("../../models/Super Admin/M_SARoom")
const { error, success } = require("../../utils/response")

const get = async (req, res) => {
    try {
        const SAData = await getSARoom()
        return success(res, 'Showing Super Admin Room', SAData)
    } catch (err) {
        return error(res, err.message)
    }
}

const postAddEdit = async (req, res) => {
    let { item, action } = req.params, payload
    try {
        switch (item) {
            case "room-type":
                payload = await addEditRoomType(req.body, action)
                break;
            case "arr":
                payload = await addEditArrangment(req.body, action)
                break;
        }
        return success(res, payload.message, payload.data)
    } catch (err) {
        return error(res, err.message)
    }
}

const postAddRoom = async (req, res) => {
    const { action } = req.params
    try {
        req.body.image =  process.env.BASE_URL + '/assets/lost-found/' + req.file.filename
        const payload = await addEditRoom(req.body, action)
        return success(res, payload.message, payload.data)
    } catch (err) {
        return error(res, err.message)
    }
}

const deleteData = async (req, res) => {
    let { id, item } = req.params, deleted
    try {
        switch(item){
            case "room-type":
                deleted  = await deleteRoomType(id)
                break;
            case "arr":
                break;
        }
        // deleted = await deleteSARoom(id, item)
        return success(res, deleted.message, deleted.data)
    } catch (err) {
        return error(res, err.message)
    }
}
module.exports = { get, postAddEdit, deleteData, postAddRoom }