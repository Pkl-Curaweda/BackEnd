const { addEditRoom, getSARoom, deleteRoom } = require("../../models/Super Admin/M_SARoom")
const { error, success } = require("../../utils/response")

const get = async () => {
    try {
        const rooms = await getSARoom()
    } catch (err) {
        return error(res, err.message)
    }
}

const postAddEdit = async (req, res) => {
    try {
        const room = await addEditRoom(req.body, req.params.action)
    } catch (err) {
        return error(res, err.message)
    }
}

const deleteData = async (req, res) => {
    let { id, item } = req.params, deleted
    try{
        switch(item){
            case "room":
                deleted = await deleteRoom(+id)
                break;
            case "room-type":
                break;
            case "arrangment":
                break;
            default:
                throw Error('Cannot be deleted')
        }
        return success(res, deleted.message, deleted.data)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { get, postAddEdit, deleteData }