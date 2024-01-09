const { prisma }  = require('../../../prisma/seeder/config')
const { error, success } = require('../../utils/response')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function get(req, res) {
  try {
    const profile = await prisma.user.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    })

    return success(res, 'Find one profile success', profile)

  } catch {
    return error(res, 'Profile not found', 404)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function update(req, res) {
  try {
    const profile = await prisma.user.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: req.body
    })

    return success(res, 'Update profile success', profile)

  } catch {
    return error(res, 'Update profile failed')
  }
}

module.exports = { get, update }