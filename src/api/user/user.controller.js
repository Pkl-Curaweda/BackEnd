const bcrypt = require('bcrypt');
const userRepository = require('./user.repository.js');
const { error, success } = require('#utils/response.js');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findAll(req, res) {
  try {
    const { users, total } = await userRepository.all(req.query)
    const lastPage = Math.ceil(total / req.query.show);
    return success(res, 'Get all user success', {
      users,
      lastPage,
      total
    })

  } catch {
    return error(res, 'Get all user failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findOne(req, res) {
  try {
    const user = await userRepository.get(req.params.id)
    return success(res, 'Get user success', user)
  } catch {
    return error(res, 'User not found', 404)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function create(req, res) {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10)
    const user = await userRepository.create(req.body)
    return success(res, 'Create user success', user)
  } catch {
    return error(res, 'Create user failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function update(req, res) {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10)
    }

    const user = await userRepository.update(req.params.id, req.body)
    return success(res, 'Update user success', user)
  } catch {
    return error(res, 'Update user failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function remove(req, res) {
  try {
    const user = await userRepository.remove(req.params.id)
    return success(res, 'Delete user success', user)
  } catch {
    return error(res, 'User not found', 404)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function document(req, res) {
  try {
    const { users } = await userRepository.all(req.query)

    return success(res, 'Get document user success', {
      head: [Object.keys(users[0])],
      body: users.map(user => {
        user.role = user.role.name
        return Object.values(user)
      })
    })

  } catch {
    return error(res, 'Get document user failed')
  }

}

module.exports = { findAll, document, remove, update, create, findOne }