const fs = require('fs');
const { prisma } = require("../../../prisma/seeder/config");
const { getFilePath, generateAssetUrl, deleteAsset, getAccessToken, verifyToken, paginate, } = require('../../utils/helper');
const { error } = require('console');
const { success } = require('../../utils/response');
const { th } = require('@faker-js/faker');

const getService = async (req, res) => {
  try {
    const userData = req.user
    const { serviceTypeId } = req.params, { id, search, sort, page, perPage } = req.query
    const { service } = prisma;
    const data = await prisma.service.findMany({
      where: {
        ...(userData.role.name === "Mitra" && { serviceType: { id: +serviceType, accessibleToMitra: true }, userId: userData.id }),
        name: { contains: search }
      },
      select: {
        id: true,
        desc: true,
        name: true,
        price: true
      },
      orderBy: { id: 'asc' }
    })
    return success(res, 'Showing Data', data)
  } catch (error) {
    console.error(error);
    return error(res, error.message);
  }
};

const getServiceLatest = async (req, res) => {
  try {
    const { serviceTypeId } = req.params;
    const service = await prisma.service.findMany({
      where: {
        serviceTypeId: parseInt(serviceTypeId, 10),
      },
      orderBy: {
        id: 'desc',
      },
      take: 1,
    });
    success(res, 'get latest service success', service, 200);
  } catch (error) {
    console.error(error);
    error(res, 'Get latest service failed', '', 404);
  }
};

const createService = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);
    const decoded = verifyToken(accessToken);
    const { name, price, desc, serviceTypeId, subTypeId } = req.body;
    const picture = req.file.filename;
    const pictureUrl = generateAssetUrl(picture);
    const service = await prisma.service.create({
      data: {
        userId: 1,
        name,
        price: parseInt(price, 10),
        desc,
        picture: pictureUrl,
        serviceTypeId: parseInt(serviceTypeId, 10),
        subTypeId: parseInt(subTypeId, 10),
        created_at: new Date(),
      },
    });

    return success(res, 'Create service success', service, 200);
  } catch (error) {
    return error(res, 'Create service failed', error.message, 400);
  }
};

const updateService = async (req, res) => {
  const picture = req.file.filename;
  try {
    const { id } = req.params;
    const accessToken = getAccessToken(req);
    const decoded = verifyToken(accessToken);
    const item = await prisma.service.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (item == null) {
      return error(res, 'Update service failed', `Service with id ${id} is not found`, 404);
    }
    const oldPicturePath = getFilePath(item.picture);
    const pictureUrl = generateAssetUrl(picture);
    const { name, price, desc, serviceTypeId, subTypeId } = req.body;
    deleteAsset(oldPicturePath);
    const service = await prisma.service.update({
      where: { id: parseInt(id, 10) },
      data: {
        userId: 1,
        name,
        price: parseInt(price, 10),
        desc,
        picture: pictureUrl,
        serviceTypeId: parseInt(serviceTypeId, 10),
        subTypeId: parseInt(subTypeId, 10),
        updated_at: new Date(),
      },
    });

    return success(res, 'update service success', service, 200);
  } catch (error) {
    fs.unlinkSync(`./public/assets/images/${picture}`);
    return error(res, 'update service failed', error.message, 404);
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.service.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (item == null) {
      return error(res, 'Delete service failed', `Service with id ${id} is not found`, 404);
    }
    const oldPicturePath = getFilePath(item.picture);
    deleteAsset(oldPicturePath);
    await prisma.service.delete({
      where: { id: parseInt(id, 10) },
    });
    return success(res, 'Service yang dipilih telah dihapus', null, 200);
  } catch (error) {
    return error(res, 'delete service failed', '', 404);
  }
};

module.exports = {
  getService,
  deleteService,
  createService,
  updateService,
  getServiceLatest,
};
