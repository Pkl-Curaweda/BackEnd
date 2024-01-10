const { ThrowError } = require("../../utils/helper")
const { error, success } = require("../../utils/response")
const arrivalDeparture = require('../../models/House Keeping/M_ArrivalDeparture')

const getArrivalDepartureData = async (req, res) => {
    const { page, perPage, sortOrder, search, date } = req.query
    try{
        const data = await arrivalDeparture.get(page, perPage, search, sortOrder, date)
        return success(res, 'Success', data)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { getArrivalDepartureData }