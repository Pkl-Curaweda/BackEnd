const { error, success } = require("../../utils/response.js")
const roomRepository = require('../../models/House Keeping/M_CleanDirtyRoom.js')
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateStatus(req, res){
  try {
    const { roomStatusId, userId } = req.body
    const room = await roomRepository.update(req.params.id, roomStatusId, userId)
    return success(res, 'Update room success', room)
  } catch {
    return error(res, 'Update room failed')
  }
}

const get = async  (req, res) => {
  const { sortOrder, arrival, depart } = req.query
  try{
    const data = await roomRepository.getCleanDirtyData(sortOrder, arrival, depart)
    return success(res, 'Get Success', data)
  }catch(err){
    return error(res, err.message)
  }
}

module.exports = { updateStatus, get }