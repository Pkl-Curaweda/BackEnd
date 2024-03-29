const { error, success } = require('../../utils/response.js');
const lostFoundRepository = require('../../models/House Keeping/M_LostFound.js');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findAll(req, res) {
  try {
    const lf = await lostFoundRepository.all(req.query)
    return success(res, 'Get Success', lf)

  } catch (err) {
    return error(res, err.message)
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

async function lostFinish(req, res) {
  const { id, status } = req.params
  try {
    if (status != "LOST") {
      for (let file of req.files) { req.body[file.fieldname] = convertFilesToURL(file.path) }
    }
    const data = await lostFoundRepository.finishLostFound(id, status, status != "LOST" ? req.body : undefined)
    return success(res, 'Update Success', data)
  } catch (err) {
    return error(res, err.message)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function create(req, res) {
  try {
    req.file.filename = process.env.BASE_URL + '/assets/lost-found/' + req.file.filename
    const lostFound = await lostFoundRepository.create(req.body, req.file.filename, req.user)
    return success(res, 'Create lost and found success', lostFound)
  } catch (e) {
    return error(res, e.message)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function update(req, res) {
  try {
    const lostFound = await lostFoundRepository.update(+req.params.id, req.body)
    return success(res, 'Update lost and found success', lostFound)
  } catch (err) {
    return error(res, err.message)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function remove(req, res) {
  let lostFound
  try {
    if (req.params.act === 'hard') {
      lostFound = await lostFoundRepository.remove(+req.params.id)
    } else lostFound = await lostFoundRepository.softDelete(+req.params.id)
    return success(res, 'Delete lost and found success', lostFound)
  } catch (err) {
    return error(res, err.message)
  }
}

function convertFilesToURL(filePath) {
  // Replace backslashes with forward slashes and remove the leading part of the path
  const urlPath = filePath.replace(/\\/g, '/').replace(/^public\//, '');
  // Concatenate with the base URL
  return `${process.env.BASE_URL}/${urlPath}`;
}

module.exports = { findAll, findOne, create, update, remove, lostFinish }