const oooRoomRepository = require('./ooo-room.repository.js');
const { error, success } = require("#utils/response.js");


/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

 async function findAll(req, res) {
  try {
    const { oooRooms, total } = await oooRoomRepository.all(req.query)
    const lastPage = Math.ceil( total / req.query.show)
    return success(res, 'Get All ooo room success', { oooRooms, lastPage, total })
  }
  catch{
    return error(res, 'Get all ooo room error')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function create(req, res) {
  try{
  const oooRoom = await oooRoomRepository.createOooRoom(req.body)
  return success(res, 'Create ooo room success', oooRoom)
  }
  catch(e){
    console.log(e)
    return error(res, 'Create ooo room failed')
  }
}

module.exports = { findAll, create }