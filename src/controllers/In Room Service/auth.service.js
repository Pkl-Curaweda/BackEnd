const bcrypt = require('bcrypt');
const { Prisma } = require('@prisma/client');
const { prisma } = require("../../../prisma/seeder/config");
const { errorResponse, successResponse, generateToken, verifyToken, encrypt, getAccessToken, decrypt } = require('../../utils/helper');

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

    return successResponse(res, 'Register success', user, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return errorResponse(res, 'Account already exists', null, 409);
      }
      return errorResponse(res, 'Invalid request', error, 400);
    }
    return errorResponse(res, 'Internal server error', error.message, 500);
  }
}

module.exports = {
  register,
};
