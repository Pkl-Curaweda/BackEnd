const { error, success } = require("../../utils/response.js")
const roomRepository = require('../../models/House Keeping/M_CleanDirtyRoom.js')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findAll(req, res) {
  try {
    const { rooms, total } = await roomRepository.all(req.query)
    const lastPage = Math.ceil(total / req.query.show);
    return success(res, 'Get all room success', {
      rooms,
      lastPage,
      total
    })
  } catch {
    return error(res, 'Get all room failed')
  }
}

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
  const { sortOrder } = req.query
  try{
    const data = await roomRepository.getCleanDirtyData(sortOrder)
    return success(res, 'Clean Dirty Room Data', data)
  }catch(err){
    return error(res, err.message)
  }
}

module.exports = { findAll, updateStatus, get }