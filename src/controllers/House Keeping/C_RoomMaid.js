const roomMaidRepository = require ('../../models/House Keeping/M_RoomMaid.js')
const { error, success } = require('../../utils/response.js')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findAll(req, res) {
  try {
    const { roomMaids, total } = await roomMaidRepository.all(req.query)
    const lastPage = Math.ceil(total / req.query.show);
    return success(res, 'Get all room maid success', {
      roomMaids,
      lastPage,
      total
    })

  } catch {
    return error(res, 'Get all room maid failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findOne(req, res) {
  try {
    const user = await roomMaidRepository.get(req.params.id)
    return success(res, 'Get user success', user)
  } catch {
    return error(res, 'User not found', 404)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

// export async function create(req, res) {
//   try {
//     req.body.password = await bcrypt.hash(req.body.password, 10)
//     const user = await roomMaidRepository.create(req.body)
//     return success(res, 'Create user success', user)
//   } catch {
//     return error(res, 'Create user failed')
//   }
// }

module.exports = { findAll, findOne }