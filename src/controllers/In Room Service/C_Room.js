const bodyParser = require('body-parser');
const Express = require('express');
require('dotenv').config()
const { prisma } = require("../../../prisma/seeder/config")
const { deleteAsset, getFilePath, generateAssetUrl, paginate, ThrowError, PrismaDisconnect, } = require('../../utils/helper');
const { error, success } = require('../../utils/response');

const app = Express();
app.use(bodyParser.json());

async function getAllData(req, res) {
  const { page } = req.query;
  const { perPage } = req.query;
  const { room } = prisma;
  const data = await paginate(room, {
    page,
    perPage,
  });

  if (!data) {
    return error(res, 'User not found', '', 404);
  }

  return success(res, `Room has been getted successfully`, data, 200);
}

async function getData(req, res) {
  const data = await prisma.room.findUnique({
    where: {
      id: parseInt(req.params.id, 10),
    },
  });

  if (!data) {
    return error(res, 'Room not found', '', 404);
  }

  return success(res, `Room ${req.params.id} has been getted successfully`, data, 200);
}

async function createData(req, res) {
  try {
    const {
      roomType,
      roomStatusId,
      roomCapacityId,
      floor,
      bedSetup,
      description,
      occupied_status,
      rateCodeId,
    } = req.body;

    const filesaved = req.file ? req.file.filename : '';
    const pictureUrl = `${process.env.BASE_URL}/public/assets/room/${filesaved}`;

    const data = await prisma.room.create({
      data: {
        roomType,
        roomImage: pictureUrl,
        roomStatus: {
          connect: { id: parseInt(roomStatusId) }
        },
        roomCapacity: {
          connect: { id: parseInt(roomCapacityId) }
        },
        floor: parseInt(floor, 10),
        bedSetup,
        description,
        occupied_status: occupied_status === 'true',
        rateCode: {
          connect: { id: rateCodeId }
        }
      },
    });

    return success(
      res,
      `Data has been inserted successfully`,
      { ...data, roomImage: pictureUrl },
      200,
    );
  } catch (error) {
    console.log(error);
    return error(res, 'An error occurred while creating the Room', '', 404);
  }
}

async function updateData(req, res) {
  try {

    const roomId = parseInt(req.params.id, 10);
    const {
      roomType,
      roomStatusId,
      roomCapacityId,
      floor,
      bedSetup,
      description,
      occupied_status,
      rateCodeId,
    } = req.body;

    const picture = req.file ? req.file.filename : '';
    const pictureUrl = picture !== null ? `${process.env.BASE_URL}/public/assets/room/${picture}` : null;
    const data = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (data === null) {
      return error(res, 'Room not found', '', 404);
    }
    const oldPicturePath = getFilePath(data.roomImage);
    const response = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        roomType,
        roomImage: pictureUrl,
        roomStatus: {
          connect: { id: parseInt(roomStatusId) }
        },
        roomCapacity: {
          connect: { id: parseInt(roomCapacityId) }
        },
        floor: parseInt(floor, 10),
        bedSetup,
        description,
        occupied_status: occupied_status === 'true',
        rateCode: {
          connect: { id: rateCodeId }
        }
      },
    });
    if (picture !== null) {
      deleteAsset(oldPicturePath);
    }
    return success(res, `Room ${roomId} has been updated successfully`, response, 200);
  } catch (err) {
    ThrowError(err)
    return error(res, 'An error occurred while updating the Room', '', 500);
  }
}

async function deleteData(req, res) {
  const roomId = parseInt(req.params.id, 10);

  try {
    const data = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!data) {
      const oldPicturePath = getFilePath(data.roomImage);
      deleteAsset(oldPicturePath);
    }

    await prisma.room.delete({
      where: {
        id: roomId,
      },
    });
    success(res, 'Room has been deleted successfully', {}, 200);
  } catch (error) {
    error(res, 'An error occurred while deleting the Room', '', 500);
  }
}

module.exports = {
  getAllData,
  getData,
  createData,
  updateData,
  deleteData,
};
