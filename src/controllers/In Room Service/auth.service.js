const bcrypt = require('bcrypt');
const { Prisma } = require('@prisma/client');
const { prisma } = require("../../../prisma/seeder/config");
const { generateToken, verifyToken, encrypt, getAccessToken, decrypt } = require('../../utils/helper');
const { success } = require('../../utils/response');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

async function register(req, res) {
  try {
    const user = await prisma.user.create({
      data: {
        ...req.body,
        picture: 'https://www.gravatar.com/avatar/?d=mp',
        password: bcrypt.hashSync(req.body.password, 10),
        roleId: 3,
      },
      select: {
        name: true,
        email: true,
        created_at: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return success(res, 'Register success', user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return error(res, 'Account already exists', 409, null);
      }
      return error(res, 'Invalid request', 400, error.message);
    }
    return error(res, 'Internal server error', 500, error.message);
  }
}

module.exports = {
  register,
};
