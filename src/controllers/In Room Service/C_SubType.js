const { prisma } = require("../../../prisma/seeder/config");
const { error, success } = require("../../utils/response");

async function getSubtypes(req, res) {
  try {
    const subTypes = await prisma.subType.findMany();
    success(res, 'Sub Type retrieved successfully', subTypes, 200);
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while fetching Sub Types', '', 500);
  }
}

async function createSubType(req, res) {
  try {
    const { name } = req.body;
    const newSubType = await prisma.subType.create({
      data: {
        name,
      },
    });
    success(res, 'Sub Type created successfully', newSubType, 201);
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while creating Sub Type', '', 500);
  }
}

async function updateSubType(req, res) {
  const subTypeId = parseInt(req.params.id, 10);

  const { name } = req.body;

  try {
    const subType = await prisma.subType.findUnique({
      where: {
        id: subTypeId,
      },
    });

    if (!subType) {
      return error(res, 'SubType not found', '', 404);
    }

    await prisma.subType.update({
      where: {
        id: subTypeId,
      },
      data: {
        name,
      },
    });

    success(res, `SubType ${subTypeId} has been updated successfully`, subType, 200);

    return success;
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while updating SubType', '', 500);

    return error;
  }
}

// menghapus subType
async function remove(req, res) {
  const subTypeId = parseInt(req.params.id, 10);
  try {
    const subType = await prisma.subType.delete({
      where: {
        id: subTypeId,
      },
    });
    success(res, 'Sub Type deleted successfully', { subType }, 200);
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while deleting Sub Type', '', 500);
  }
}

module.exports = {
  getSubtypes,
  createSubType,
  updateSubType,
  remove,
};
