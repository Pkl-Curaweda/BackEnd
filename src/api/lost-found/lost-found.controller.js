const { error, success } = require('../../utils/response.js');
const lostFoundRepository = require('./lost-found.repository');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function findAll(req, res) {
  try {
    const { lostFounds, total, found, lost, onProgress } = await lostFoundRepository.all(req.query)
    const lastPage = Math.ceil(total / req.query.show);
    return success(res, 'Get all lost and found success', {
      lostFounds,
      lastPage,
      total,
      found,
      lost,
      onProgress,
    })

  } catch {
    return error(res, 'Get all lost and found failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function findOne(req, res) {
  try {
    const lostFound = await lostFoundRepository.get(req.params.id)
    return success(res, 'Get lost and found success', lostFound)
  } catch {
    return error(res, 'Lost and found not found', 404)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function create(req, res) {
  try {
    req.file.filename = process.env.APP_URL + '/public/lost-found/' + req.file.filename
    const lostFound = await lostFoundRepository.create(req.body, req.file.filename, req.user.id)
    return success(res, 'Create lost and found success', lostFound)
  } catch(e) {
    console.log(e)
    return error(res, 'Create lost and found failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function update(req, res) {
  try {
    const lostFound = await lostFoundRepository.update(req.params.id, req.body)
    return success(res, 'Update lost and found success', lostFound)
  } catch {
    return error(res, 'Update lost and found failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function remove(req, res) {
  try {
    const lostFound = await lostFoundRepository.remove(req.params.id)
    return success(res, 'Delete lost and found success', lostFound)
  } catch {
    return error(res, 'Lost and found not found', 404)
  }
}

module.exports = { findAll, findOne, create, update, remove }