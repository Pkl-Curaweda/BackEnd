const { prisma } = require("../../../prisma/seeder/config");
const { success } = require("../../utils/response");
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

async function get(req, res) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: parseInt(req.params.id, 10), deleted: false
      },
    });

    return success(res, `User ${req.params.id} has been getted successfully`, user, 200);
  } catch (error) {
    return error(res, 'User not found', 404);
  }
}

module.exports = { get };
