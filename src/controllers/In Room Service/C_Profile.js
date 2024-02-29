const { prisma } = require("../../../prisma/seeder/config");
const { verifyToken, getAccessToken, ThrowError, PrismaDisconnect } = require('../../utils/helper');
const { error, success } = require('../../utils/response');
const { update } = require("./C_ProductReq");
const user = require('../../models/Authorization/M_User');
const { use } = require("../../routes/R_InRoomService");

async function getData(req, res) {
  try {
    const { id } = req.user
    const data = await prisma.user.findFirstOrThrow({
      where: { deleted: false, id },
      select: {
        picture: true,
        name: true,
        username: true,
        gender: true,
        birthday: true,
        phone: true,
        email: true,
      },
    });

    return success(res, 'User has been retrieved successfully', data);
  } catch (err) {
    ThrowError(err)
    return error(res, 'Internal server error', 500);
  }
}

const updateProfile =  async (req, res) => {
  try{
    const body = req.body, { id} = req.user
    const updatedUser = await user.update(id, body)
    return success(res, `User ${updatedUser.name} updated`, updatedUser)
  }catch(err){
    return error(res, err.message)
  }finally{
    await PrismaDisconnect()
  }
}

module.exports = {
  getData, updateProfile
};
