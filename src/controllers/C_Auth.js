const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require("../../prisma/seeder/config.js");
const { randomStr } = require('../utils/string.js');
const { success, error } = require('../utils/response.js');
const { encrypt, decrypt } = require('../utils/encryption.js');
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function login(req, res) {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return error(res, 'Email not found', 404)
  const match = await bcrypt.compare(password, user.password)
  if (!match) return error(res, 'Wrong password', 401)

  const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
  const refreshToken = await prisma.userToken.create({
    data: {
      userId: user.id,
      refreshToken: randomStr(100),
      expired_at: expires
    }
  })

  res.cookie('refresh_token', encrypt(refreshToken.refreshToken), {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires,
  })

  const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
    expiresIn: '15m',
    subject: user.id.toString()
  })

  delete user.password
  return success(res, `Login success as ${user.name}`, { user, accessToken })
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function refresh(req, res) {
  let refreshToken;

  try {
    refreshToken = decrypt(req.cookies.refresh_token)
    refreshToken = await prisma.userToken.findUniqueOrThrow({
      where: { refreshToken }
    })
  } catch {
    return error(res, 'Invalid refresh token')
  }

  if (Date.now() > refreshToken.expired_at.getTime()) {
    return error(res, 'Refresh token expired', 405)
  }

  await prisma.userToken.delete({ where: { id: refreshToken.id } })

  const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
  const newRefreshToken = await prisma.userToken.create({
    data: {
      userId: refreshToken.userId,
      refreshToken: randomStr(100),
      expired_at: expires
    }
  })

  res.cookie('refresh_token', encrypt(newRefreshToken.refreshToken), {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires,
  })

  const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
    expiresIn: '15m',
    subject: newRefreshToken.userId.toString()
  })

  return success(res, 'Token Refresh Successfully', { accessToken })
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logout(req, res) {
  try {
    const refreshToken = decrypt(req.cookies.refresh_token)
    await prisma.userToken.delete({ where: { refreshToken } })
  } catch {
    return error(res, 'Invalid refresh token')
  }

  res.clearCookie('refresh_token')
  return success(res, 'Logout success')
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function me(req, res) {
  return success(res, 'Get Success', req.user)
}

module.exports = { login, refresh, logout, me }