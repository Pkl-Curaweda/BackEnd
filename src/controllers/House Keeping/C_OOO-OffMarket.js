const oooRoomRepository = require('../../models/House Keeping/M_OOORoom.js');
const { error, success } = require("../../utils/response.js");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

async function findAll(req, res) {
  try {
    const oooRoom = await oooRoomRepository.all(req.query)
    return success(res, 'Get Success', oooRoom)
  }
  catch {
    return error(res, 'Get all ooo room error')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
*/
async function create(req, res) {
  try {
    req.body.userId = req.user.id
    const oooRoom = await oooRoomRepository.createOooRoom(req.body.xType, req.body)
    return success(res, `${req.body.xType} Created Successfully`, oooRoom)
  }
  catch (e) {
    return error(res, e)
  }
}

module.exports = { findAll, create }