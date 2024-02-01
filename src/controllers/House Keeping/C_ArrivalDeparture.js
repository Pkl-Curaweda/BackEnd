const { ThrowError } = require("../../utils/helper")
const { error, success } = require("../../utils/response")
const arrivalDeparture = require('../../models/House Keeping/M_ArrivalDeparture')

const getArrivalDepartureData = async (req, res) => {
    const { page, perPage, sortOrder, search, arrival, depart } = req.query
    try{
        const data = await arrivalDeparture.get(page, perPage, search, sortOrder, arrival, depart)
        return success(res, 'Get Success', data)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { getArrivalDepartureData }