const { prisma } = require("../../../prisma/seeder/config");
const { verifyToken, getAccessToken, deleteAsset, paginate, ThrowError } = require('../../utils/helper');
const { error, success } = require('../../utils/response');

async function create(req, res) {
  try {
    const userId = req.user.id
    const { name, typeId, desc, price, subTypeId } = req.body;

    if (!name || !typeId || !desc || !price || !subTypeId) {
      return error(res, 'All required fields must be provided');
    }
    const picture = `${process.env.BASE_URL}/public/assets/services/${req.file.filename}`;
    const service = await prisma.service.create({
      data: {
        name, userId, price: +price, desc, serviceTypeId: +typeId, subTypeId: +subTypeId, picture
      }
    })
    await prisma.productReq.create({
      data: { userId, serviceId: service.id }
    });

    return success(res, `${name} sended for an Approval`, service)
  } catch (err) {
    ThrowError(err)
    return error(res, err.message);
  }
}


async function getAll(req, res) {
  try {
    const userId = req.user.id
    const { productReq } = prisma;
    const data = await productReq.findMany({ where: { userId },
      select: {
        id: true,
        service: { select:{ approved: true} },
        user: {
          select: { name: true }
        }
      }
    })
    return success(res, 'Product requests retrieved successfully', data);
  } catch (err) {
    ThrowError(err)
    return error(res, 'An error occurred while fetching product requests');
  }
}



// Mendapatkan product request berdasarkan ID
async function getProductReqById(req, res) {
  const productReqId = parseInt(req.params.id, 10);

  try {
    const productReq = await prisma.productReq.findUnique({
      where: {
        id: productReqId,
      },
    });

    if (productReq) {
      success(
        res,
        `Product request ${productReqId} has been retrieved successfully`,
        productReq,
        200,
      );
    } else {
      error(res, 'Product request not found', '', 404);
    }
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while fetching product request data', '', 500);
  }
}

async function getProductReqByUserId(req, res) {
  const userId = parseInt(req.params.userId, 10);

  try {
    // Tambahkan filter where berdasarkan userId pada saat mengambil data productReq
    const productReq = await prisma.productReq.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        picture: true,
        title: true,
        price: true,
        typeId: true,
        desc: true,
        serviceTypeId: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (productReq.length > 0) {
      success(
        res,
        `Product requests for user ${userId} have been retrieved successfully`,
        productReq,
        200,
      );
    } else {
      error(res, 'Product requests not found for the user', '', 404);
    }
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while fetching product request data', '', 500);
  }
}

// Mendapatkan product request berdasarkan Status
async function getProductReqByStatus(req, res) {
  const { status } = req.params;

  try {
    const productReq = await prisma.productReq.findMany({
      where: {
        statusProductReq: status,
      },
      select: {
        id: true,
        picture: true,
        title: true,
        price: true,
        typeId: true,
        serviceTypeId: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (productReq.length > 0) {
      success(
        res,
        `Product request with status ${status} has been retrieved successfully`,
        productReq,
        200,
      );
    } else {
      error(res, 'Product request not found', '', 404);
    }
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while fetching product request data', '', 500);
  }
}

// Mengupdate product request
async function update(req, res) {
  const productReqId = parseInt(req.params.id, 10);

  const { title, typeId, desc, price, status, serviceTypeId } = req.body;

  try {
    const accessToken = getAccessToken(req);
    // Decode the refresh token
    const decoded = verifyToken(accessToken);

    // Retrieve user ID from the decoded token
    const userId = decoded.id;
    if (!userId) return error(res, 'Forbiden credentials is invalid', '', 403);

    const productReq = await prisma.productReq.findUnique({
      where: {
        id: productReqId,
      },
    });

    if (!productReq) {
      return error(res, 'Product request not found', '', 404);
    }

    if (req.file) {
      const newFilesaved = req.file.filename;
      const newPictureUrl = `${process.env.BASE_URL}/public/assets/images/${newFilesaved}`;
      await prisma.productReq.update({
        where: {
          id: productReqId,
        },
        data: {
          title,
          typeId: parseInt(typeId.toString(), 10),
          userId: parseInt(userId.toString(), 10),
          desc,
          price: parseInt(price.toString(), 10),
          status,
          picture: newPictureUrl,
          serviceTypeId: parseInt(serviceTypeId.toString(), 10),
        },
      });

      // Hapus file gambar lama
      const oldPictureUrl = productReq.picture;
      const oldFilesaved = oldPictureUrl.split('/').pop();
      console.log(oldFilesaved);
      const oldPicturePath = `./public/assets/images/${oldFilesaved}`;
      deleteAsset(oldPicturePath);
    } else {
      await prisma.productReq.update({
        where: {
          id: productReqId,
        },
        data: {
          title,
          typeId: parseInt(typeId.toString(), 10),
          desc,
          price: parseInt(price.toString(), 10),
          serviceTypeId: parseInt(serviceTypeId.toString(), 10),
        },
      });
    }

    success(
      res,
      `Product request ${productReqId} has been updated successfully`,
      productReq,
      200,
    );

    // Pastikan untuk mengembalikan respons di sini
    return success;
  } catch (error) {
    console.log(error);
    error(res, 'An error occurred while updating the product request', '', 500);

    // Pastikan untuk mengembalikan respons di sini
    return error;
  }
}

// Menghapus product request
async function remove(req, res) {
  const productReqId = parseInt(req.params.id, 10);
  try {
    const productReq = await prisma.productReq.findUnique({
      where: {
        id: productReqId,
      },
    });

    if (productReq) {
      const pictureUrl = productReq.picture;
      const filesaved = pictureUrl.split('/').pop();
      const picturePath = `./public/assets/images/${filesaved}`;
      deleteAsset(picturePath);
    }

    await prisma.productReq.delete({
      where: {
        id: productReqId,
      },
    });
    success(res, 'Product request has been deleted successfully', {}, 200);
  } catch (error) {
    error(res, 'An error occurred while deleting the product request', '', 500);
  }
}

async function acceptProductReq(req, res) {
  const productReqId = parseInt(req.params.id, 10);

  try {
    const productReq = await prisma.productReq.findUnique({
      where: {
        id: productReqId,
      },
    });

    if (!productReq) {
      return error(res, 'Product request not found', '', 404);
    }

    if (productReq.statusProductReq === 'ACCEPTED') {
      return error(res, 'Product request has already been accepted', '', 400);
    }

    if (productReq.statusProductReq === 'REJECTED') {
      return error(
        res,
        'Product request has been rejected and cannot be accepted',
        '',
        400,
      );
    }

    // Ubah status menjadi ACCEPTED
    await prisma.productReq.update({
      where: {
        id: productReqId,
      },
      data: {
        statusProductReq: 'ACCEPTED',
      },
    });

    // Tambahkan Service baru dengan informasi dari productReq
    const newService = await prisma.service.create({
      data: {
        userId: productReq.userId,
        name: productReq.title,
        price: productReq.price,
        desc: productReq.desc,
        picture: productReq.picture,
        serviceTypeId: productReq.serviceTypeId,
        subTypeId: productReq.typeId,
      },
    });

    success(res, 'Product request accepted successfully', newService, 200);
    return newService;
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while accepting the product request', '', 500);
    throw error;
  }
}

async function rejectProductReq(req, res) {
  const productReqId = parseInt(req.params.id, 10);

  try {
    const productReq = await prisma.productReq.findUnique({
      where: {
        id: productReqId,
      },
    });

    if (!productReq) {
      return error(res, 'Product request not found', '', 404);
    }

    if (productReq.statusProductReq === 'REJECTED') {
      return error(res, 'Product request has already been rejected', '', 400);
    }

    if (productReq.statusProductReq === 'ACCEPTED') {
      return error(
        res,
        'Product request has been accepted and cannot be rejected',
        '',
        400,
      );
    }

    // Ubah status menjadi REJECTED
    await prisma.productReq.update({
      where: {
        id: productReqId,
      },
      data: {
        statusProductReq: 'REJECTED',
      },
    });

    success(res, 'Product request rejected successfully', {}, 200);
    return {};
  } catch (error) {
    console.error(error);
    error(res, 'An error occurred while rejecting the product request', '', 500);
    throw error;
  }
}

module.exports = {
  create,
  getAll,
  getProductReqById,
  getProductReqByStatus,
  update,
  remove,
  acceptProductReq,
  rejectProductReq,
  getProductReqByUserId,
};
