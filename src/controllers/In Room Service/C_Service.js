const { prisma } = require("../../../prisma/seeder/config");
const { getFilePath, generateAssetUrl, deleteAsset, getAccessToken, verifyToken, paginate, ThrowError, PrismaDisconnect, } = require('../../utils/helper');
const { success, error } = require('../../utils/response');

const getService = async (req, res) => {
  const { serviceTypeId } = req.params, { id, search, sort, page, perPage } = req.query
  try {
    const userData = req.user
    const data = await prisma.service.findMany({
      where: {
        serviceType: { id: +serviceTypeId },
        ...(userData.role.name === "Mitra" && { userId: userData.id, id: { in: userData.serviceShown.serviceTypes } }),
        name: { contains: search }
      },
      select: {
        id: true,
        desc: true,
        name: true,
        picture: true,
        price: true
      },
      orderBy: { id: 'asc' }
    })

    return success(res, 'Showing Data', data)
  } catch (err) {
    ThrowError(err)
    return error(res, err.message)
  }
};

const getServiceById = async (req, res) => {
  const { id } = req.params, sendedData = { service: undefined, subTypes: undefined }
  try{
    sendedData.subTypes = await prisma.subType.findMany({ select: { id: true, name: true } })
    if (id) sendedData.service = await prisma.service.findFirstOrThrow({ where: { id: +id } })
    return success(res, 'Showing Service', { ...sendedData })
  }catch(err){
    ThrowError(err)
    return error(res, err.message)
  }
}

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
  const { id, serviceShown } = req.user
  const { name, price, desc, serviceTypeId, subTypeId } = req.body;
  try {
    const allowToCreate = serviceShown.serviceTypes.some(type => +serviceTypeId === type)
    if(!allowToCreate) throw Error('You cannot create item with this Type')
    const pictureUrl = generateAssetUrl(req.file.filename);
    const service = await prisma.service.create({
      data: {
        userId: id,
        name,
        price: +price,
        desc,
        picture: pictureUrl,
        serviceTypeId: +serviceTypeId,
        subTypeId: +subTypeId,
      },
    });

    return success(res, 'Create service success', service, 200);
  } catch (err) {
    console.log(err)
    return error(res, err.message);
  }
};

const updateService = async (req, res) => {
  const { id } = req.params
  try {
    if(req.file) req.body.picture = generateAssetUrl(req.file.filename)
    if(req.body.price) req.body.price = +req.body.price
    const exist = await prisma.service.findFirstOrThrow({ where: { id: +id }  });
    const service = await prisma.service.update({
      where: { id: +id },
      data: {
        ...req.body
      },
    });
    return success(res, 'update service success', service, 200);
  } catch (err) {
    return error(res, err.message);
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
  getServiceById,
  getServiceLatest,
};
