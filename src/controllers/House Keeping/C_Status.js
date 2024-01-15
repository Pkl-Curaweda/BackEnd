
const { getStatusData } = require("../../models/House Keeping/M_Status")
const { error, success } = require("../../utils/response")

const get = async (req, res) => {
    try {
        const statusData = await getStatusData(req.query)
        return success(res, 'Operation Success', statusData)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get }